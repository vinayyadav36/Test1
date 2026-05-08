import { NextFunction, Response } from 'express';
import { NotFoundError } from '../../common/errors';
import { AuthRequest } from '../../common/types';
import { mapDocument, mapDocuments, normalizeDocument } from '../../common/utils';
import { Task } from '../models/Task';

export async function listTasksHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tasks = await Task.find({ businessId: req.businessId, archived: false }).sort({ createdAt: -1 }).lean();
    res.json({ data: mapDocuments(tasks) });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskStatusHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await Task.findOne({ _id: req.params.id, businessId: req.businessId, archived: false });
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    task.status = typeof req.body.status === 'string' ? req.body.status : task.status;
    task.updatedByUserId = req.user?.id;
    await task.save();

    res.json({ data: mapDocument(normalizeDocument(task)) });
  } catch (error) {
    next(error);
  }
}
