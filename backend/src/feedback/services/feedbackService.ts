import { BadRequestError } from '../../common/errors';
import { mapDocument, mapDocuments, normalizeDocument } from '../../common/utils';
import { PaginatedResponse, PaginationParams } from '../../common/types';
import { recordEvent } from '../../events/services/eventService';
import { Feedback, FeedbackDocument, FeedbackSentiment } from '../models/Feedback';

export interface CreateFeedbackPayload {
  customerPhone?: string;
  rating?: number;
  transcript?: string;
  sentiment?: FeedbackSentiment;
  serviceType?: string;
  staffName?: string;
  audioUrl?: string;
}

function deriveSentiment(payload: CreateFeedbackPayload): FeedbackSentiment | undefined {
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

export async function createFeedback(
  businessId: string,
  payload: CreateFeedbackPayload,
): Promise<ReturnType<typeof mapDocument>> {
  if (payload.rating !== undefined && (payload.rating < 1 || payload.rating > 5)) {
    throw new BadRequestError('rating must be between 1 and 5');
  }

  const feedback = await Feedback.create({
    businessId,
    ...payload,
    sentiment: deriveSentiment(payload),
  });

  const mappedFeedback = mapDocument(normalizeDocument(feedback));
  await recordEvent(businessId, 'feedback.created', mappedFeedback);

  return mappedFeedback;
}

export async function getFeedbackList(
  businessId: string,
  pagination: PaginationParams,
): Promise<PaginatedResponse<ReturnType<typeof mapDocument>>> {
  const [feedback, total] = await Promise.all([
    Feedback.find({ businessId })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Feedback.countDocuments({ businessId }),
  ]);

  return {
    data: mapDocuments(feedback),
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}
