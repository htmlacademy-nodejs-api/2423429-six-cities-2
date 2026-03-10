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
import { UploadFileMiddleware } from '../../libs/rest/middleware/upload-file.middleware.js';
import { PrivateRouteMiddleware } from '../../libs/rest/middleware/private-route.middleware.js';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { AuthService } from '../auth/auth-service.interface.js';
import '../../types/request.type.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.AuthService) private readonly authService: AuthService,
    @inject(Component.PrivateRouteMiddleware) private readonly privateRouteMiddleware: PrivateRouteMiddleware
  ) {
    super(logger);

    this.logger.info('UserController initialized');

    // Публичные маршруты
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
    this.addRoute({
      path: '/users/me',
      method: HttpMethod.Get,
      handler: this.getCurrentUser,
      middlewares: [this.privateRouteMiddleware]
    });

    // Приватные маршруты для аватара (требуют авторизации)
    this.addRoute({
      path: '/users/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        this.privateRouteMiddleware,
        new UploadFileMiddleware(
          this.config.get('UPLOAD_DIRECTORY'),
          'avatar',
          5 * 1024 * 1024 // 5 Mb
        ),
      ]
    });

    this.addRoute({
      path: '/users/avatar',
      method: HttpMethod.Delete,
      handler: this.deleteAvatar,
      middlewares: [
        this.privateRouteMiddleware
      ]
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

  private getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'UserController'
      );
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `User with id ${userId} not found`
      );
    }

    const userResponse = plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, userResponse);
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

    // Генерируем JWT токен через AuthService
    const token = await this.authService.authenticate(
      user._id.toString(),
      user.email,
      user.name,
      user.type
    );

    const userResponse = plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, {
      user: userResponse,
      token: token
    });
  });

  private uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    // Получаем userId из токена
    const userId = req.user?.userId;
    const file = req.file;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'UserController'
      );
    }

    if (!file) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Avatar file is missing'
      );
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `User with id ${userId} not found`
      );
    }

    // Если у пользователя уже был аватар и он не дефолтный - удаляем старый файл
    if (user.avatar && user.avatar !== 'default-avatar.jpg') {
      try {
        const oldFileName = user.avatar.replace('/static/', '');
        const oldFilePath = join(process.cwd(), this.config.get('UPLOAD_DIRECTORY'), oldFileName);
        await unlink(oldFilePath);
        this.logger.info(`Old avatar deleted: ${oldFileName}`);
      } catch (error) {
        this.logger.warn(`Failed to delete old avatar: ${error}`);
      }
    }

    // Формируем URL для нового аватара
    const avatarUrl = `/static/${file.filename}`;

    // Обновляем аватар пользователя
    user.avatar = avatarUrl;
    await user.save();

    const userResponse = plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, {
      success: true,
      user: userResponse,
      avatar: avatarUrl,
      message: 'Avatar uploaded successfully'
    });
  });

  private deleteAvatar = asyncHandler(async (req: Request, res: Response) => {
    // Получаем userId из токена
    const userId = req.user?.userId;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'UserController'
      );
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `User with id ${userId} not found`
      );
    }

    // Если есть аватар и он не дефолтный - удаляем файл
    if (user.avatar && user.avatar !== 'default-avatar.jpg') {
      try {
        const fileName = user.avatar.replace('/static/', '');
        const filePath = join(process.cwd(), this.config.get('UPLOAD_DIRECTORY'), fileName);
        await unlink(filePath);
        this.logger.info(`Avatar deleted: ${fileName}`);
      } catch (error) {
        this.logger.warn(`Failed to delete avatar file: ${error}`);
      }
    }

    // Возвращаем дефолтный аватар вместо пустой строки
    user.avatar = 'default-avatar.jpg';
    await user.save();

    const userResponse = plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, {
      success: true,
      user: userResponse,
      message: 'Avatar deleted successfully'
    });
  });
}
