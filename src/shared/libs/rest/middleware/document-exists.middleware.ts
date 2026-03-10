import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Middleware } from './middleware.interface.js';
import { HttpError } from '../errors/http-error.js';
import { DocumentExists } from '../types/document-exists.interface.js';

export class DocumentExistsMiddleware implements Middleware {
  constructor(
    private readonly service: DocumentExists,
    private readonly entityName: string,
    private readonly paramName: string,
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params[this.paramName].toString();

      if (!documentId) {
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          `${this.paramName} parameter is missing`,
          { param: this.paramName }
        );
      }

      const exists = await this.service.exists(documentId);

      if (!exists) {
        throw new HttpError(
          StatusCodes.NOT_FOUND,
          `${this.entityName} with id ${documentId} not found`,
          { entity: this.entityName, id: documentId }
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  }
}
