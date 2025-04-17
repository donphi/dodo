import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../logging/logging.service';

export function ErrorHandlingMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const logger = new LoggingService();
  logger.error('Unhandled error', err);

  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred. Please try again later.',
  });
}