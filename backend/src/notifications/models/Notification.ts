import { Schema, model } from 'mongoose';
import { JsonRecord } from '../../common/types';

export interface NotificationDocument {
  businessId: Schema.Types.ObjectId;
  type: string;
  message: string;
  payload?: JsonRecord;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    payload: { type: Schema.Types.Mixed },
    seen: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

notificationSchema.index({ businessId: 1, seen: 1, createdAt: -1 });

export const Notification = model<any>('Notification', notificationSchema);
