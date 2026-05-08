import { BadRequestError } from '../../common/errors';
import { PaginatedResponse, PaginationParams } from '../../common/types';
import { mapDocument, mapDocuments, normalizeDocument } from '../../common/utils';
import { recordEvent } from '../../events/services/eventService';
import { Feedback } from '../models/Feedback';

export interface CreateFeedbackPayload {
  customerPhone?: string;
  rating?: number;
  transcript?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  serviceType?: string;
  staffName?: string;
  audioUrl?: string;
  audioMeta?: {
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
  };
  createdByUserId?: string;
  source?: 'manual' | 'system';
}

export interface FeedbackFilters {
  status?: string;
  rating?: number;
}

function deriveSentiment(payload: CreateFeedbackPayload): 'positive' | 'neutral' | 'negative' | undefined {
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

export async function createFeedback(businessId: string, payload: CreateFeedbackPayload): Promise<any> {
  if (payload.rating !== undefined && (payload.rating < 1 || payload.rating > 5)) {
    throw new BadRequestError('rating must be between 1 and 5');
  }

  const feedback = await Feedback.create({
    businessId,
    customerPhone: payload.customerPhone,
    rating: payload.rating,
    transcript: payload.transcript,
    sentiment: deriveSentiment(payload),
    serviceType: payload.serviceType,
    staffName: payload.staffName,
    audioUrl: payload.audioUrl,
    audioMeta: payload.audioMeta,
    transcriptStatus: payload.audioUrl || payload.audioMeta ? 'pending' : 'not_uploaded',
    status: 'open',
    createdByUserId: payload.createdByUserId,
    updatedByUserId: payload.createdByUserId,
    source: payload.source ?? 'manual',
    archived: false,
  });

  const mappedFeedback = mapDocument(normalizeDocument(feedback));
  await recordEvent(businessId, 'feedback.created', mappedFeedback);
  return mappedFeedback;
}

export async function updateFeedback(businessId: string, feedbackId: string, payload: Record<string, unknown>, userId?: string): Promise<any> {
  const feedback = await Feedback.findOne({ _id: feedbackId, businessId, archived: false });
  if (!feedback) {
    throw new BadRequestError('feedback not found');
  }

  if (typeof payload.status === 'string') {
    feedback.status = payload.status;
  }
  if (typeof payload.ownerNote === 'string') {
    feedback.ownerNote = payload.ownerNote;
  }
  feedback.updatedByUserId = userId;
  await feedback.save();

  return mapDocument(normalizeDocument(feedback));
}

export async function getFeedbackList(
  businessId: string,
  pagination: PaginationParams,
  filters: FeedbackFilters,
): Promise<PaginatedResponse<any>> {
  const query: Record<string, unknown> = { businessId, archived: false };
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.rating) {
    query.rating = filters.rating;
  }

  const [feedback, total] = await Promise.all([
    Feedback.find(query).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
    Feedback.countDocuments(query),
  ]);

  return {
    data: mapDocuments(feedback),
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}
