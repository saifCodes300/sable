import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
      index: true,
    },
    estimatedDelivery: { type: String, default: '' },
    contact: {
      email: { type: String, required: true },
      newsletter: { type: Boolean, default: false },
    },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingMethod: { type: String, default: 'standard' },
    promo: { type: mongoose.Schema.Types.Mixed, default: null },
    items: [orderItemSchema],
    totals: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      discountedSubtotal: { type: Number, required: true },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true },
      itemCount: { type: Number, default: 1 },
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'online', 'cod'],
      default: 'card',
      index: true,
    },
    paymentSummary: {
      method: { type: String, default: 'Online Payment' },
      brand: { type: String, default: 'Card' },
      last4: { type: String, default: '0000' },
      upiId: { type: String, default: '' },
      bank: { type: String, default: '' },
      status: { type: String, default: 'Paid' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Order = mongoose.model('Order', orderSchema);
