import { Schema, model } from 'mongoose';

const eventLogSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: { type: String, required: true, trim: true },
    payload: { type: Schema.Types.Mixed, required: true },
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

eventLogSchema.index({ businessId: 1, type: 1, createdAt: -1 });

export const EventLog = model<any>('EventLog', eventLogSchema);
