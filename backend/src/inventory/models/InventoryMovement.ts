import { Schema, model } from 'mongoose';

export type InventoryMovementType = 'sale' | 'purchase' | 'adjustment';

export interface InventoryMovementDocument {
  businessId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  type: InventoryMovementType;
  quantity: number;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryMovementSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: { type: String, enum: ['sale', 'purchase', 'adjustment'], required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

inventoryMovementSchema.index({ businessId: 1, productId: 1, date: -1 });

export const InventoryMovement = model<any>('InventoryMovement', inventoryMovementSchema);
