import { NextFunction, Response } from 'express';
import { UnauthorizedError } from '../../common/errors';
import { AuthRequest } from '../../common/types';

export function tenantMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  if (!req.user?.businessId) {
    next(new UnauthorizedError('Business context not found'));
    return;
  }

  req.businessId = req.user.businessId;
  next();
}
