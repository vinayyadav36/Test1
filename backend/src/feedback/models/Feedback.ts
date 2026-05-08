import { Schema, model } from 'mongoose';

const feedbackSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    customerPhone: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    transcript: { type: String, trim: true },
    transcriptStatus: { type: String, enum: ['not_uploaded', 'pending', 'ready'], default: 'not_uploaded' },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    serviceType: { type: String, trim: true },
    staffName: { type: String, trim: true },
    audioUrl: { type: String, trim: true },
    audioMeta: {
      fileName: { type: String },
      mimeType: { type: String },
      sizeBytes: { type: Number },
    },
    status: { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
    ownerNote: { type: String, trim: true },
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

feedbackSchema.index({ businessId: 1, createdAt: -1 });
feedbackSchema.index({ businessId: 1, status: 1, createdAt: -1 });
feedbackSchema.index({ businessId: 1, rating: 1, createdAt: -1 });

export const Feedback = model<any>('Feedback', feedbackSchema);
