import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'shipping', 'fixed'], default: 'percent' },
    value: { type: Number, required: true },
    description: { type: String, default: '' },
    minSubtotal: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
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

export const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
