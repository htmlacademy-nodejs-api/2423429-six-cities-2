import { StatusCodes } from 'http-status-codes';

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(message: string, details?: unknown): HttpError {
    return new HttpError(StatusCodes.BAD_REQUEST, message, details);
  }

  static notFound(message: string, details?: unknown): HttpError {
    return new HttpError(StatusCodes.NOT_FOUND, message, details);
  }

  static unauthorized(message: string, details?: unknown): HttpError {
    return new HttpError(StatusCodes.UNAUTHORIZED, message, details);
  }

  static forbidden(message: string, details?: unknown): HttpError {
    return new HttpError(StatusCodes.FORBIDDEN, message, details);
  }

  static internal(message: string, details?: unknown): HttpError {
    return new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, message, details);
  }
}
