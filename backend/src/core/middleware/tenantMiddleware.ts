import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/types';
import { UnauthorizedError } from '../../common/errors';

export function tenantMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.businessId) {
    next(new UnauthorizedError('Business context not found'));
    return;
  }
  next();
}
