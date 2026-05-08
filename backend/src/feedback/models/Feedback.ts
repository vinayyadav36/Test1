import { Schema, model } from 'mongoose';

export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';

export interface FeedbackDocument {
  businessId: Schema.Types.ObjectId;
  customerPhone?: string;
  rating?: number;
  transcript?: string;
  sentiment?: FeedbackSentiment;
  serviceType?: string;
  staffName?: string;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    customerPhone: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    transcript: { type: String, trim: true },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    serviceType: { type: String, trim: true },
    staffName: { type: String, trim: true },
    audioUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

feedbackSchema.index({ businessId: 1, createdAt: -1 });

export const Feedback = model<any>('Feedback', feedbackSchema);
