import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/index.js';
import { HttpMethod } from '../../libs/rest/index.js';
import { UserResponseDto } from './dto/user-response.dto.js';

export class UserController extends BaseController {
  constructor(
    protected readonly logger: Logger
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
  }

  private getUsers = asyncHandler(async (_req: Request, res: Response) => {
    const mockUser: UserResponseDto = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
      isPro: false
    };

    this.ok(res, [mockUser]);
  });

  private getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id.toString();
    const mockUser: UserResponseDto = {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
      isPro: false
    };

    this.ok(res, mockUser);
  });

  private createUser = asyncHandler(async (req: Request, res: Response) => {
    const mockUser: UserResponseDto = {
      id: 'new-id',
      email: req.body.email || 'new@example.com',
      name: req.body.name || 'New User',
      avatarUrl: req.body.avatarUrl,
      isPro: req.body.isPro || false
    };

    this.created(res, mockUser);
  });
}
