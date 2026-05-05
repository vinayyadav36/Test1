import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  category?: string;
  unit: string;
  currentStock: number;
  reorderLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String },
    unit: { type: String, required: true },
    currentStock: { type: Number, default: 0 },
    reorderLevel: { type: Number },
  },
  { timestamps: true }
);

ProductSchema.index({ businessId: 1, sku: 1 }, { unique: true });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
