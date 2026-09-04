import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  status?: number;
  code?: number;
  errors?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error with level based on status code
  if (status >= 500) {
    logger.error(`API Error ${status} on ${req.method} ${req.url}`, err);
  } else {
    logger.warn(`API Warning ${status} on ${req.method} ${req.url}: ${message}`);
  }

  res.status(status).json({
    success: false,
    status,
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
}
