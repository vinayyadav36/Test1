import { NextFunction, Response } from 'express';
import { NotFoundError } from '../../common/errors';
import { AuthRequest } from '../../common/types';
import { notificationRepository } from '../../storage/repositories/notificationRepository';

export async function listNotificationsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const notifications = await notificationRepository.listByBusinessId(req.businessId!);
    res.json({ data: notifications });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationSeenHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const notification = await notificationRepository.findById(String(req.params.id), req.businessId!);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    const updated = await notificationRepository.update({ ...notification, seen: true });
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
}
