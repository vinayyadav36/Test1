import { Schema, model } from 'mongoose';

const productSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    unit: { type: String, required: true, trim: true },
    currentStock: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, min: 0 },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    source: { type: String, enum: ['manual', 'system'], default: 'manual' },
    archived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index({ businessId: 1, sku: 1 }, { unique: true });
productSchema.index({ businessId: 1, category: 1, name: 1 });

export const Product = model<any>('Product', productSchema);
