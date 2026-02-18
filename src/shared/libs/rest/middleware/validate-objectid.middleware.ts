import { Types } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Middleware } from './middleware.interface.js';
import { HttpError } from '../errors/http-error.js';

export class ValidateObjectIdMiddleware implements Middleware {
  constructor(private readonly paramName: string) {}

  public execute(req: Request, _res: Response, next: NextFunction): void {
    const objectId = req.params[this.paramName].toString();

    if (Types.ObjectId.isValid(objectId)) {
      return next();
    }

    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      `Invalid ObjectId: ${objectId}`,
      { param: this.paramName, value: objectId }
    );
  }
}
