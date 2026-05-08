import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../common/types';
import { parsePagination } from '../../common/utils';
import { createFeedback, getFeedbackList } from '../services/feedbackService';

export async function createFeedbackHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const feedback = await createFeedback(req.businessId!, {
      customerPhone: typeof req.body.customerPhone === 'string' ? req.body.customerPhone : undefined,
      rating: typeof req.body.rating === 'number' ? req.body.rating : typeof req.body.rating === 'string' ? Number(req.body.rating) : undefined,
      transcript: typeof req.body.transcript === 'string' ? req.body.transcript : undefined,
      sentiment: typeof req.body.sentiment === 'string' ? req.body.sentiment : undefined,
      serviceType: typeof req.body.serviceType === 'string' ? req.body.serviceType : undefined,
      staffName: typeof req.body.staffName === 'string' ? req.body.staffName : undefined,
      audioUrl: typeof req.body.audioUrl === 'string' ? req.body.audioUrl : undefined,
    });

    res.status(201).json({ data: feedback });
  } catch (error) {
    next(error);
  }
}

export async function listFeedbackHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getFeedbackList(req.businessId!, parsePagination(req.query as Record<string, unknown>), {
      rating: typeof req.query.rating === 'string' ? Number(req.query.rating) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}
