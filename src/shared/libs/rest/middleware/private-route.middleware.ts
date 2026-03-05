import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Middleware } from './middleware.interface.js';
import { HttpError } from '../errors/http-error.js';
import { inject, injectable } from 'inversify';
import { Component } from '../../../types/component.enum.js';
import { AuthService } from '../../../modules/auth/auth-service.interface.js';

@injectable()
export class PrivateRouteMiddleware implements Middleware {
  constructor(
    @inject(Component.AuthService) private readonly authService: AuthService
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
        throw new HttpError(
          StatusCodes.UNAUTHORIZED,
          'Authorization header is missing',
          'PrivateRouteMiddleware'
        );
      }

      const [bearer, token] = authorizationHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new HttpError(
          StatusCodes.UNAUTHORIZED,
          'Invalid authorization header format. Use: Bearer <token>',
          'PrivateRouteMiddleware'
        );
      }

      const payload = await this.authService.verify(token);

      // Добавляем информацию о пользователе в request
      req.user = payload;

      return next();
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid or expired token',
        'PrivateRouteMiddleware'
      );
    }
  }
}
