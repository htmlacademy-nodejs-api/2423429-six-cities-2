import { UserService } from './user-service.interface.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { UserEntity } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { Component, UserType } from '../../types/index.js';
import { inject, injectable } from 'inversify';
import { Logger } from '../../libs/logger/index.js';
import { createSHA256 } from '../../helpers/index.js';

@injectable()
export class DefaultUserService implements UserService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>
  ) {}

  public async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const result = await this.userModel.create({
      ...dto,
      avatar: dto.avatar || 'default-avatar.jpg',
      type: dto.type || UserType.Regular,
      password: createSHA256(dto.password, salt)
    });

    this.logger.info(`New user created: ${result.email}`);
    return result;
  }

  public async find(): Promise<DocumentType<UserEntity>[]> {
    return this.userModel.find().exec();
  }

  public async findById(id: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async findOrCreate(userData: {
    name: string;
    email: string;
    password: string;
    type: UserType;
    avatar?: string;
  }, salt: string): Promise<DocumentType<UserEntity>> {
    const existingUser = await this.findByEmail(userData.email);

    if (existingUser) {
      this.logger.info(`User found: ${userData.email}`);
      return existingUser;
    }

    this.logger.info(`Creating new user: ${userData.email}`);

    const createUserDto = new CreateUserDto(
      userData.name,
      userData.email,
      userData.password,
      userData.type,
      userData.avatar
    );

    return this.create(createUserDto, salt);
  }

  public async verifyPassword(email: string, password: string, salt: string): Promise<boolean> {
    const user = await this.findByEmail(email);

    if (!user) {
      this.logger.warn(`User not found: ${email}`);
      return false;
    }

    const isValid = user.verifyPassword(password, salt);

    if (isValid) {
      this.logger.info(`Password verified for user: ${email}`);
    } else {
      this.logger.warn(`Invalid password for user: ${email}`);
    }

    return isValid;
  }
}
