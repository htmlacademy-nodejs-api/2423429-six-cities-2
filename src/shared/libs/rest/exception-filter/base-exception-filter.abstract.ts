import { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';
import { ExceptionFilter } from './exception-filter.interface.js';
import { Logger } from '../../logger/index.js';

@injectable()
export abstract class BaseExceptionFilter implements ExceptionFilter {
  constructor(protected readonly logger: Logger) {}

  public catch(error: Error, req: Request, _res: Response, next: NextFunction): void {
    // Простой вариант - только сообщение и ошибка
    this.logger.error(
      `[ExceptionFilter] Error on ${req.method} ${req.url}`,
      error
    );

    // Базовая обработка - просто передаем дальше
    next(error);
  }
}
