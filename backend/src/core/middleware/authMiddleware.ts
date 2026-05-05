import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../../common/types';
import { UnauthorizedError } from '../../common/errors';

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.headers['x-demo-user-id'] as string | undefined;
    if (!userId) {
      return next(new UnauthorizedError('Missing x-demo-user-id header'));
    }
    const user = await User.findById(userId).lean();
    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }
    req.user = {
      _id: String(user._id),
      businessId: String(user.businessId),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    req.businessId = String(user.businessId);
    next();
  } catch (err) {
    next(err);
  }
}
