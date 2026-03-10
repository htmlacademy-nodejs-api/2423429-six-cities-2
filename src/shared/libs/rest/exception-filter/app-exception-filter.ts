
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { BaseExceptionFilter } from './base-exception-filter.abstract.js';
import { Logger } from '../../logger/index.js';
import { HttpError } from '../errors/http-error.js';
import { Component } from '../../../types/index.js';

@injectable()
export class AppExceptionFilter extends BaseExceptionFilter {
  constructor(
    @inject(Component.Logger) logger: Logger
  ) {
    super(logger);
  }

  public override catch(error: Error, req: Request, res: Response, next: NextFunction): void {
    // Вызываем базовый метод для логирования
    super.catch(error, req, res, next);

    // Обработка HTTP ошибок
    if (error instanceof HttpError) {
      this.sendHttpError(res, error);
      return;
    }

    // Обработка остальных ошибок
    this.sendInternalError(res, error);
  }

  private sendHttpError(res: Response, error: HttpError): void {
    res.status(error.statusCode).json({
      type: 'HttpError',
      error: error.message,
      details: error.details || {},
    });
  }

  private sendInternalError(res: Response, error: Error): void {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: 'InternalServerError',
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development'
        ? { originalError: error.message }
        : {},
    });
  }
}
