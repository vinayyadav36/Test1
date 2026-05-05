import { Feedback, IFeedback } from '../models/Feedback';
import { PaginationParams, PaginatedResponse } from '../../common/types';

export interface CreateFeedbackPayload {
  rating?: number;
  transcript?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
  serviceType?: string;
  staffName?: string;
  customerPhone?: string;
}

export async function createFeedback(
  businessId: string,
  payload: CreateFeedbackPayload
): Promise<IFeedback> {
  const feedback = new Feedback({
    businessId,
    ...payload,
    audioUrl: null,
  });
  return feedback.save();
}

export async function getFeedbackList(
  businessId: string,
  pagination: PaginationParams
): Promise<PaginatedResponse<IFeedback>> {
  const { page, limit, skip } = pagination;
  const [data, total] = await Promise.all([
    Feedback.find({ businessId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Feedback.countDocuments({ businessId }),
  ]);
  return { data: data as unknown as IFeedback[], total, page, limit };
}
