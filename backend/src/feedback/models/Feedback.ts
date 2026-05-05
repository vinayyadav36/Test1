import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  businessId: mongoose.Types.ObjectId;
  customerPhone?: string;
  rating?: number;
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
  transcript?: string;
  audioUrl?: string | null;
  serviceType?: string;
  staffName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    customerPhone: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative', null], default: null },
    transcript: { type: String },
    audioUrl: { type: String, default: null },
    serviceType: { type: String },
    staffName: { type: String },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
