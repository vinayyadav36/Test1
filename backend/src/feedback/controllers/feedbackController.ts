import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../common/types';
import { parsePagination } from '../../common/utils';
import { createFeedback, getFeedbackList, updateFeedback } from '../services/feedbackService';

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
      audioMeta: typeof req.body.audioMeta === 'object' && req.body.audioMeta ? (req.body.audioMeta as any) : undefined,
      createdByUserId: req.user?.id,
      source: 'manual',
    });

    res.status(201).json({ data: feedback });
  } catch (error) {
    next(error);
  }
}

export async function updateFeedbackHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const feedback = await updateFeedback(req.businessId!, req.params.id, req.body as Record<string, unknown>, req.user?.id);
    res.json({ data: feedback });
  } catch (error) {
    next(error);
  }
}

export async function listFeedbackHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getFeedbackList(req.businessId!, parsePagination(req.query as Record<string, unknown>), {
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      rating: typeof req.query.rating === 'string' ? Number(req.query.rating) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}
