// src/shared/modules/user/user.controller.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/index.js';
import { HttpMethod } from '../../libs/rest/index.js';
import { UserResponseDto } from './rdo/user-response.rdo.js';
import { UserService } from './user-service.interface.js';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto.js';
import { loginUserSchema, LoginUserDto } from './dto/login-user.dto.js';
import { plainToInstance } from 'class-transformer';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/index.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/validate-dto.middleware.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly config: Config<RestSchema>
  ) {
    super(logger);

    this.logger.info('UserController initialized');

    this.addRoute({
      path: '/users',
      method: HttpMethod.Post,
      handler: this.createUser,
      middlewares: [new ValidateDtoMiddleware(createUserSchema)]
    });

    this.addRoute({
      path: '/users/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(loginUserSchema)]
    });
  }

  private createUser = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as CreateUserDto;

    const salt = this.config.get('SALT');
    if (!salt) {
      throw new HttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'SALT is not configured in environment variables'
      );
    }

    const user = await this.userService.create(dto, salt);

    const userResponse = plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.created(res, userResponse);
  });

  private login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginUserDto;

    const salt = this.config.get('SALT');
    if (!salt) {
      throw new HttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'SALT is not configured in environment variables'
      );
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid email or password'
      );
    }

    const isValid = await this.userService.verifyPassword(email, password, salt);
    if (!isValid) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid email or password'
      );
    }

    const userResponse = plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, {
      user: userResponse,
      token: 'jwt-token-will-be-added-later'
    });
  });
}
