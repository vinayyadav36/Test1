import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryMovement extends Document {
  businessId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  type: 'sale' | 'purchase' | 'adjustment';
  quantity: number;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: { type: String, enum: ['sale', 'purchase', 'adjustment'], required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { timestamps: true }
);

export const InventoryMovement = mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);
