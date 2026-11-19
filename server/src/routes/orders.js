import express from 'express';
import { Order } from '../models/Order.js';
import { optionalAuth, protect } from '../middleware/auth.js';

const router = express.Router();

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

// POST /orders
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      userId,
      contact,
      shippingAddress,
      shippingMethod = 'standard',
      promo,
      items,
      totals,
      paymentMethod = 'card',
      paymentBrand,
      paymentLast4,
      upiId,
      netbankingBank,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }
    if (!shippingAddress || !contact) {
      return res.status(400).json({ message: 'Shipping address and contact email are required.' });
    }

    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const shipping = shippingMethod === 'express' ? 35 : subtotal >= 200 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const computedTotal = Math.round((subtotal + shipping + tax) * 100) / 100;

    const finalTotals =
      totals && typeof totals.total === 'number'
        ? totals
        : {
            subtotal,
            discount: 0,
            discountedSubtotal: subtotal,
            shipping,
            tax,
            total: computedTotal,
            itemCount: items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
          };

    const orderId = `SBL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isCod = paymentMethod === 'cod';

    const order = await Order.create({
      id: orderId,
      userId: req.user ? req.user._id.toString() : (userId || null),
      contact,
      shippingAddress,
      shippingMethod,
      promo: promo || null,
      items,
      totals: finalTotals,
      paymentMethod,
      paymentSummary: {
        method: isCod
          ? 'Cash on Delivery'
          : paymentMethod === 'upi'
            ? 'UPI Online Payment'
            : paymentMethod === 'netbanking'
              ? 'Netbanking'
              : 'Online Card Payment',
        brand: isCod
          ? 'Cash on Delivery'
          : paymentBrand || (paymentMethod === 'upi' ? 'UPI' : 'Card'),
        last4: isCod ? '' : (paymentLast4 || '0000'),
        upiId: upiId || '',
        bank: netbankingBank || '',
        status: isCod ? 'Pending on Delivery' : 'Paid',
      },
      status: 'Processing',
      estimatedDelivery: estimateDeliveryDate(shippingMethod),
    });

    return res.status(201).json({
      data: order,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[Order Place Error]:', err);
    return res.status(500).json({ message: err.message || 'Error placing order.' });
  }
});

// GET /orders
router.get('/', optionalAuth, async (req, res) => {
  try {
    let query = {};
    if (req.user) {
      query.$or = [{ userId: req.user._id.toString() }, { 'contact.email': req.user.email }];
    } else if (req.query.userId) {
      query.userId = req.query.userId;
    } else if (req.query.email) {
      query['contact.email'] = req.query.email.toLowerCase();
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return res.json({
      data: orders,
      meta: { total: orders.length, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id }).lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    return res.json({
      data: order,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
