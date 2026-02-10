import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/index.js';
import { HttpMethod } from '../../libs/rest/index.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UserService } from './user-service.interface.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { plainToInstance } from 'class-transformer';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/index.js';
import { Config, RestSchema } from '../../libs/config/index.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly config: Config<RestSchema>
  ) {
    super(logger);

    this.addRoute({
      path: '/users',
      method: HttpMethod.Get,
      handler: this.getUsers,
    });

    this.addRoute({
      path: '/users/:id',
      method: HttpMethod.Get,
      handler: this.getUserById,
    });

    this.addRoute({
      path: '/users',
      method: HttpMethod.Post,
      handler: this.createUser,
    });

    this.addRoute({
      path: '/users/login',
      method: HttpMethod.Post,
      handler: this.login,
    });
  }

  private getUsers = asyncHandler(async (_req: Request, res: Response) => {
    // В production нужно добавить пагинацию
    const users = await this.userService.find();
    const usersResponse = users.map((user) =>
      plainToInstance(UserResponseDto, user.toObject(), {
        excludeExtraneousValues: true,
      })
    );

    this.ok(res, usersResponse);
  });

  private getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id.toString();
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const userResponse = plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, userResponse);
  });

  private createUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, type, avatar } = req.body;

    if (!name || !email || !password || !type) {
      throw new Error('Missing required fields: name, email, password, type');
    }

    const createUserDto = new CreateUserDto(name, email, password, type, avatar);

    const salt = this.config.get('SALT');
    if (!salt) {
      throw new Error('SALT is not configured in environment variables');
    }

    const user = await this.userService.create(createUserDto, salt);

    const userResponse = plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.created(res, userResponse);
  });

  private login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const salt = this.config.get('SALT');
    if (!salt) {
      throw new Error('SALT is not configured in environment variables');
    }

    const isValid = await this.userService.verifyPassword(email, password, salt);

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const userResponse = plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, { user: userResponse, token: 'jwt-token-will-be-added-later' });
  });
}
