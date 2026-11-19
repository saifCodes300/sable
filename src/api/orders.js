import {
  USE_MOCK,
  createResponse,
  httpRequest,
  readStorage,
  simulateLatency,
  writeStorage,
} from './client';
import { calcTotals } from '../utils/calcTotals';

const ORDERS_STORAGE_KEY = 'sable_orders';

const SEEDED_DEMO_ORDERS = [
  {
    id: 'SBL-2026-8419',
    userId: 'user-demo-1',
    status: 'Delivered',
    createdAt: '2026-10-18T11:30:00Z',
    estimatedDelivery: 'October 24, 2026',
    contact: {
      email: 'atelier@sable.co',
      newsletter: true,
    },
    shippingAddress: {
      firstName: 'Alexander',
      lastName: 'Vance',
      address: '42 Mercer Street, Apt 5B',
      city: 'New York',
      state: 'NY',
      zip: '10013',
      country: 'United States',
      phone: '+1 (212) 555-0194',
    },
    shippingMethod: 'standard',
    promo: null,
    items: [
      {
        productId: 'sbl-001',
        slug: 'silk-wool-camp-collar-shirt',
        name: 'Silk-Wool Camp Collar Shirt',
        price: 420,
        color: 'Ink',
        size: 'M',
        quantity: 1,
        image: '/images/products/silk-wool-camp-collar-shirt-ink-1.png',
      },
      {
        productId: 'sbl-013',
        slug: 'marche-suede-penny-loafer',
        name: 'Marche Unlined Suede Penny Loafer',
        price: 520,
        color: 'Taupe',
        size: '42',
        quantity: 1,
        image: '/images/products/marche-suede-penny-loafer-taupe-1.png',
      },
    ],
    totals: calcTotals({
      items: [
        { price: 420, quantity: 1 },
        { price: 520, quantity: 1 },
      ],
      promo: null,
      shippingMethod: 'standard',
    }),
    paymentSummary: {
      brand: 'Visa',
      last4: '4242',
    },
  },
  {
    id: 'SBL-2026-8902',
    userId: 'user-demo-1',
    status: 'Shipped',
    createdAt: '2026-11-11T16:10:00Z',
    estimatedDelivery: 'November 19, 2026',
    contact: {
      email: 'atelier@sable.co',
      newsletter: true,
    },
    shippingAddress: {
      firstName: 'Alexander',
      lastName: 'Vance',
      address: '42 Mercer Street, Apt 5B',
      city: 'New York',
      state: 'NY',
      zip: '10013',
      country: 'United States',
      phone: '+1 (212) 555-0194',
    },
    shippingMethod: 'express',
    promo: { code: 'SABLE10', type: 'percent', value: 10, description: '10% off your order' },
    items: [
      {
        productId: 'sbl-007',
        slug: 'ribbed-cashmere-crewneck',
        name: 'Ribbed Cashmere Crewneck',
        price: 540,
        color: 'Cream',
        size: 'M',
        quantity: 1,
        image: '/images/products/ribbed-cashmere-crewneck-cream-1.png',
      },
    ],
    totals: calcTotals({
      items: [{ price: 540, quantity: 1 }],
      promo: { code: 'SABLE10', type: 'percent', value: 10 },
      shippingMethod: 'express',
    }),
    paymentSummary: {
      brand: 'Mastercard',
      last4: '5555',
    },
  },
];

function loadAllOrders() {
  const existing = readStorage(ORDERS_STORAGE_KEY, null);
  if (existing === null) {
    writeStorage(ORDERS_STORAGE_KEY, SEEDED_DEMO_ORDERS);
    return SEEDED_DEMO_ORDERS;
  }
  return existing;
}

function estimateDeliveryDate(shippingMethod) {
  const days = shippingMethod === 'express' ? 3 : 6;
  const target = new Date();
  target.setDate(target.getDate() + days);
  return target.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function placeOrder(payload) {
  if (!USE_MOCK) {
    return httpRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  await simulateLatency(450, 600);

  const totals = calcTotals({
    items: payload.items,
    promo: payload.promo,
    shippingMethod: payload.shippingMethod,
  });

  const orderId = `SBL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const isCod = payload.paymentMethod === 'cod';

  // Never store raw card number or CVC
  const order = {
    id: orderId,
    userId: payload.userId || null,
    status: 'Processing',
    createdAt: new Date().toISOString(),
    estimatedDelivery: estimateDeliveryDate(payload.shippingMethod),
    contact: payload.contact,
    shippingAddress: payload.shippingAddress,
    shippingMethod: payload.shippingMethod,
    promo: payload.promo || null,
    items: payload.items,
    totals,
    paymentMethod: payload.paymentMethod || 'card',
    paymentSummary: {
      method: isCod
        ? 'Cash on Delivery'
        : payload.paymentMethod === 'upi'
          ? 'UPI Online Payment'
          : payload.paymentMethod === 'netbanking'
            ? 'Netbanking'
            : 'Online Card Payment',
      brand: isCod
        ? 'Cash on Delivery'
        : payload.paymentBrand || (payload.paymentMethod === 'upi' ? 'UPI' : 'Card'),
      last4: isCod ? '' : (payload.paymentLast4 || '0000'),
      upiId: payload.upiId || '',
      bank: payload.netbankingBank || '',
      status: isCod ? 'Pending on Delivery' : 'Paid',
    },
  };

  const orders = loadAllOrders();
  writeStorage(ORDERS_STORAGE_KEY, [order, ...orders]);

  return createResponse(order);
}

export async function getOrders(userId = null) {
  if (!USE_MOCK) {
    return httpRequest('/orders');
  }

  await simulateLatency();
  const orders = loadAllOrders();
  const filtered = userId
    ? orders.filter((o) => o.userId === userId)
    : orders;

  return createResponse(filtered, { total: filtered.length });
}

export async function getOrderById(id) {
  if (!USE_MOCK) {
    return httpRequest(`/orders/${encodeURIComponent(id)}`);
  }

  await simulateLatency(250, 450);
  const orders = loadAllOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  return createResponse(order);
}
