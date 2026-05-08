import { Schema, model } from 'mongoose';

const businessSettingsSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    businessType: { type: String, required: true, default: 'kirana', trim: true },
    forecastHorizonDays: { type: Number, required: true, default: 7, min: 1 },
    safetyFactor: { type: Number, required: true, default: 1.2, min: 1 },
    preferredUnits: { type: [String], default: ['pcs', 'kg', 'ltr'] },
    notificationThresholds: {
      lowStockWarningDays: { type: Number, default: 7, min: 1 },
      lowStockCriticalDays: { type: Number, default: 3, min: 1 },
    },
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

export const BusinessSettings = model<any>('BusinessSettings', businessSettingsSchema);
