import { Schema, model } from 'mongoose';

const inventoryMovementSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: { type: String, enum: ['sale', 'purchase', 'adjustment'], required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String, trim: true },
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

inventoryMovementSchema.index({ businessId: 1, productId: 1, date: -1 });
inventoryMovementSchema.index({ businessId: 1, type: 1, date: -1 });

export const InventoryMovement = model<any>('InventoryMovement', inventoryMovementSchema);
