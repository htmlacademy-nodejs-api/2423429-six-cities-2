import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { UserEntity } from './user.entity.js';
import { UserService } from './user-service.interface.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { createSHA256 } from '../../helpers/index.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

console.log('🔥🔥🔥 USER SERVICE FILE IS LOADED! 🔥🔥🔥');
console.log('🔥🔥🔥 This should appear in console! 🔥🔥🔥');

interface MongoError extends Error {
  code: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
}

@injectable()
export class DefaultUserService implements UserService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>
  ) {}

  public async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    this.logger.info('🔵 CREATE USER SERVICE METHOD STARTED');
    this.logger.info(`📧 Email: ${dto.email}`);
    this.logger.info(`🧂 Salt provided: ${!!salt}`);

    this.logger.info('🔍 Checking if user exists...');
    const existingUser = await this.findByEmail(dto.email);
    this.logger.info(`📌 Existing user: ${existingUser ? 'FOUND' : 'NOT FOUND'}`);

    if (existingUser) {
      this.logger.info('🚨 USER ALREADY EXISTS! Creating HttpError...');

      const error = new HttpError(
        StatusCodes.CONFLICT,
        `User with email ${dto.email} already exists`,
        { field: 'email', value: dto.email }
      );

      this.logger.info(`🔥 HttpError created: ${JSON.stringify({
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details
      })}`);

      this.logger.info('🚀 Throwing HttpError from service...');
      throw error;
    }

    this.logger.info('✅ User not found, creating new...');
    try {
      const hashedPassword = createSHA256(dto.password, salt);
      this.logger.info('🔐 Password hashed successfully');

      const user = await this.userModel.create({
        ...dto,
        password: hashedPassword
      });

      this.logger.info(`🎉 User created successfully: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.info(`💥 ERROR during user creation: ${error}`);

      if (this.isMongoError(error) && error.code === 11000) {
        this.logger.info('📌 MongoDB duplicate error (11000) caught in service!');

        const mongoError = new HttpError(
          StatusCodes.CONFLICT,
          `User with email ${dto.email} already exists`,
          { field: 'email', value: dto.email }
        );

        this.logger.info('🔥 Throwing HttpError from MongoDB error');
        throw mongoError;
      }

      this.logger.info('❌ Unknown error, rethrowing...');
      throw error;
    }
  }

  private isMongoError(error: unknown): error is MongoError {
    const isMongo = typeof error === 'object' && error !== null && 'code' in error;
    this.logger.info(`🔍 Checking if MongoDB error: ${isMongo}`);
    return isMongo;
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    this.logger.info(`🔍 findByEmail called for: ${email}`);
    const user = await this.userModel.findOne({ email }).exec();
    this.logger.info(`📌 findByEmail result: ${user ? 'User found' : 'User not found'}`);
    return user;
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

  public async findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    this.logger.info(`🟡 findOrCreate called for: ${dto.email}`);

    const existingUser = await this.findByEmail(dto.email);

    if (existingUser) {
      this.logger.info('🟡 User found, returning existing');
      return existingUser;
    }

    this.logger.info('🟡 User not found, creating new via create()');
    const newUser = await this.create(dto, salt);
    return newUser;
  }
}
