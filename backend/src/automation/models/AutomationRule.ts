import { Schema, model } from 'mongoose';
import { JsonRecord } from '../../common/types';

export interface AutomationRuleDocument {
  businessId: Schema.Types.ObjectId;
  name: string;
  triggerType: string;
  conditions: JsonRecord;
  actionType: string;
  actionPayload: JsonRecord;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const automationRuleSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    triggerType: { type: String, required: true, trim: true },
    conditions: { type: Schema.Types.Mixed, default: {} },
    actionType: { type: String, required: true, trim: true },
    actionPayload: { type: Schema.Types.Mixed, default: {} },
    enabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AutomationRule = model<any>('AutomationRule', automationRuleSchema);
