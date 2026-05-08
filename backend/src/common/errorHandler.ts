import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from './errors';
import { logger } from './logger';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(422).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: Object.values(err.errors).map((issue) => issue.message),
      },
    });
    return;
  }

  if (err instanceof mongoose.Error && 'code' in err && err.code === 11000) {
    res.status(409).json({
      error: {
        message: 'Duplicate value',
        code: 'DUPLICATE_KEY',
      },
    });
    return;
  }

  logger.error('request.failed', {
    error: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}
