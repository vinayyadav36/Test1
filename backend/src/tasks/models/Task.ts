import { Schema, model } from 'mongoose';

const taskSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['open', 'in_progress', 'done'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    payload: { type: Schema.Types.Mixed, default: {} },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    source: { type: String, enum: ['manual', 'system'], default: 'system' },
    archived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

taskSchema.index({ businessId: 1, status: 1, createdAt: -1 });

export const Task = model<any>('Task', taskSchema);
