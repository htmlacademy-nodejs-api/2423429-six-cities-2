import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';
import { BaseExceptionFilter } from './base-exception-filter.abstract.js';
import { Logger } from '../../logger/index.js';
import { HttpError } from '../errors/http-error.js';

@injectable()
export class AppExceptionFilter extends BaseExceptionFilter {
  constructor(logger: Logger) {
    super(logger);
  }

  public catch(error: Error, req: Request, res: Response, _next: NextFunction): void {
    this.logger.error(`[Exception Filter] ${error.message}`, error);

    if (error instanceof HttpError) {
      // Обработка HTTP ошибок
      res.status(error.statusCode).json({
        type: 'HttpError',
        error: error.message,
        details: error.details || {},
      });
      return;
    }

    // Обработка остальных ошибок
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: 'InternalServerError',
      error: 'Internal server error',
      details: {},
    });
  }
}
