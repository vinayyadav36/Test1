import { NextFunction, Response } from 'express';
import { NotFoundError } from '../../common/errors';
import { AuthRequest } from '../../common/types';
import { mapDocument, mapDocuments, normalizeDocument } from '../../common/utils';
import { Notification } from '../models/Notification';

export async function listNotificationsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const notifications = await Notification.find({ businessId: req.businessId }).sort({ createdAt: -1 }).lean();
    res.json({ data: mapDocuments(notifications) });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationSeenHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, businessId: req.businessId },
      { seen: true },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    res.json({ data: mapDocument(normalizeDocument(notification)) });
  } catch (error) {
    next(error);
  }
}
