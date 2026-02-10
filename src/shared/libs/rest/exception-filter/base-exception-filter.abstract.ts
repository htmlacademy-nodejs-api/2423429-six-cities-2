import { NextFunction, Request, Response } from 'express';
import { ExceptionFilter } from './exception-filter.interface.js';
import { Logger } from '../../logger/index.js';

export abstract class BaseExceptionFilter implements ExceptionFilter {
  constructor(protected readonly logger: Logger) {}

  public catch(error: Error, req: Request, res: Response, next: NextFunction): void {
    // Будет реализовано в наследниках
  }
}
