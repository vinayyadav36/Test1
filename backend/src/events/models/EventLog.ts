import { Schema, model } from 'mongoose';
import { JsonRecord } from '../../common/types';

export interface EventLogDocument {
  businessId: Schema.Types.ObjectId;
  type: string;
  payload: JsonRecord;
  createdAt: Date;
  updatedAt: Date;
}

const eventLogSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: { type: String, required: true, trim: true },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

eventLogSchema.index({ businessId: 1, type: 1, createdAt: -1 });

export const EventLog = model<any>('EventLog', eventLogSchema);
