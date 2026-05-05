import client from './client';

export interface FeedbackPayload {
  rating?: number;
  transcript?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
  serviceType?: string;
  staffName?: string;
  customerPhone?: string;
}

export interface Feedback {
  _id: string;
  businessId: string;
  rating?: number;
  transcript?: string;
  sentiment?: string | null;
  serviceType?: string;
  staffName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackListResponse {
  data: Feedback[];
  total: number;
  page: number;
  limit: number;
}

export async function createFeedback(payload: FeedbackPayload): Promise<Feedback> {
  const { data } = await client.post<Feedback>('/api/feedback', payload);
  return data;
}

export async function fetchFeedback(page = 1, limit = 20): Promise<FeedbackListResponse> {
  const { data } = await client.get<FeedbackListResponse>('/api/feedback', {
    params: { page, limit },
  });
  return data;
}
