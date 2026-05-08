import { BadRequestError } from '../../common/errors';
import { Feedback, FeedbackSentiment, PaginatedResponse, PaginationParams } from '../../common/types';
import { recordEvent } from '../../events/services/eventService';
import { feedbackRepository } from '../../storage/repositories/feedbackRepository';

export interface CreateFeedbackPayload {
  customerPhone?: string;
  rating?: number;
  transcript?: string;
  sentiment?: FeedbackSentiment;
  serviceType?: string;
  staffName?: string;
  audioUrl?: string;
}

function inferSentiment(payload: CreateFeedbackPayload): FeedbackSentiment | undefined {
  if (payload.sentiment) {
    return payload.sentiment;
  }
  if (payload.rating === undefined) {
    return undefined;
  }
  if (payload.rating <= 2) {
    return 'negative';
  }
  if (payload.rating >= 4) {
    return 'positive';
  }
  return 'neutral';
}

export async function createFeedback(businessId: string, payload: CreateFeedbackPayload): Promise<Feedback> {
  if (payload.rating !== undefined && (payload.rating < 1 || payload.rating > 5)) {
    throw new BadRequestError('rating must be between 1 and 5');
  }

  const feedback = await feedbackRepository.create({
    businessId,
    customerPhone: payload.customerPhone,
    rating: payload.rating,
    transcript: payload.transcript,
    sentiment: inferSentiment(payload),
    serviceType: payload.serviceType,
    staffName: payload.staffName,
    audioUrl: payload.audioUrl,
  });

  await recordEvent(businessId, 'feedback.created', feedback);
  return feedback;
}

export async function getFeedbackList(
  businessId: string,
  pagination: PaginationParams,
  filters?: { rating?: number },
): Promise<PaginatedResponse<Feedback>> {
  const allFeedback = await feedbackRepository.listByBusinessId(businessId, filters);
  return {
    data: allFeedback.slice(pagination.skip, pagination.skip + pagination.limit),
    total: allFeedback.length,
    page: pagination.page,
    limit: pagination.limit,
  };
}
