// src/shared/modules/user/user.service.ts
import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { UserEntity } from './user.entity.js';
import { UserService } from './user-service.interface.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { createSHA256 } from '../../helpers/index.js';

@injectable()
export class DefaultUserService implements UserService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>
  ) {}

  public async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const user = await this.userModel.create({
      ...dto,
      password: createSHA256(dto.password, salt)
    });
    this.logger.info(`New user created: ${user.email}`);
    return user;
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async findById(id: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findById(id).exec();
  }

  public async find(): Promise<DocumentType<UserEntity>[]> {
    return this.userModel.find().exec();
  }

  public async verifyPassword(email: string, password: string, salt: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) {
      return false;
    }
    const hashPassword = createSHA256(password, salt);
    return user.password === hashPassword;
  }

  public async exists(id: string): Promise<boolean> {
    return this.userModel.exists({ _id: id }).then(Boolean);
  }
}
