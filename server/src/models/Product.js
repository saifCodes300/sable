import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    images: [{ type: String, required: true }],
  },
  { _id: false }
);

const sizeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, lowercase: true, index: true },
    subcategory: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    fabric: { type: String, default: '' },
    careInstructions: { type: String, default: '' },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    isNew: { type: Boolean, default: false },
    featured: { type: Boolean, default: false, index: true },
    colors: [colorSchema],
    sizes: [sizeSchema],
    tags: [{ type: String, lowercase: true }],
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model('Product', productSchema);
