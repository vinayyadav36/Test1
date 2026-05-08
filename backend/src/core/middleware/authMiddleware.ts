import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../common/types';
import { UnauthorizedError } from '../../common/errors';
import { isObjectId } from '../../common/utils';
import { User } from '../models/User';

export async function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const headerValue = req.header('x-demo-user-id');

    if (!headerValue) {
      return next(new UnauthorizedError('Missing x-demo-user-id header'));
    }

    if (!isObjectId(headerValue)) {
      return next(new UnauthorizedError('Invalid demo user id'));
    }

    const user = await User.findById(headerValue).lean();

    if (!user) {
      return next(new UnauthorizedError('Demo user not found'));
    }

    req.user = {
      id: String(user._id),
      businessId: String(user.businessId),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
