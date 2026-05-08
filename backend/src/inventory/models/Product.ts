import { Schema, model } from 'mongoose';

export interface ProductDocument {
  businessId: Schema.Types.ObjectId;
  name: string;
  sku: string;
  category?: string;
  unit: string;
  currentStock: number;
  reorderLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    unit: { type: String, required: true, trim: true },
    currentStock: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index({ businessId: 1, sku: 1 }, { unique: true });

export const Product = model<any>('Product', productSchema);
