import { NextFunction, Response } from 'express';
import { UnauthorizedError } from '../../common/errors';
import { AuthRequest } from '../../common/types';
import { config } from '../../config/env';
import { userRepository } from '../../storage/repositories/userRepository';

export async function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!config.enableDemoAuth) {
      throw new UnauthorizedError('Demo auth is disabled');
    }

    const userId = req.header('x-demo-user-id');
    if (!userId) {
      throw new UnauthorizedError('Missing x-demo-user-id header');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Demo user not found');
    }

    req.user = {
      id: user.id,
      businessId: user.businessId,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
