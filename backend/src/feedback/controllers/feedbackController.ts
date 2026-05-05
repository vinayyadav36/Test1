import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/types';
import { createFeedback, getFeedbackList } from '../services/feedbackService';
import { parsePagination } from '../../common/utils';

export async function createFeedbackHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { rating, transcript, sentiment, serviceType, staffName, customerPhone } = req.body as Record<string, unknown>;
    const businessId = req.businessId!;
    const feedback = await createFeedback(businessId, {
      rating: rating !== undefined ? Number(rating) : undefined,
      transcript: transcript as string | undefined,
      sentiment: sentiment as 'positive' | 'neutral' | 'negative' | null | undefined,
      serviceType: serviceType as string | undefined,
      staffName: staffName as string | undefined,
      customerPhone: customerPhone as string | undefined,
    });
    res.status(201).json(feedback);
  } catch (err) {
    next(err);
  }
}

export async function listFeedbackHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const businessId = req.businessId!;
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const result = await getFeedbackList(businessId, pagination);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
