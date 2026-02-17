// src/shared/libs/rest/middleware/validate-dto.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import { Middleware } from './middleware.interface.js';
import { HttpError } from '../errors/http-error.js';

export class ValidateDtoMiddleware implements Middleware {
  constructor(private readonly schema: Joi.Schema) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const value = await this.schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      req.body = value;
      return next();
    } catch (error) {
      // Проверяем тип ошибки
      if (error instanceof Joi.ValidationError) {
        const errorMessages = error.details.map((detail) =>
          `${detail.path.join('.')}: ${detail.message}`
        ).join('; ');

        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          `Validation failed: ${errorMessages}`,
          { details: error.details }
        );
      }

      // Если это не ValidationError, пробрасываем дальше
      throw error;
    }
  }
}
