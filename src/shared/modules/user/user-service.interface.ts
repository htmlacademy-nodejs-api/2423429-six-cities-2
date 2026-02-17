// src/shared/modules/user/user-service.interface.ts
import { DocumentType } from '@typegoose/typegoose';
import { UserEntity } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';

export interface UserService {
  create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;
  findById(id: string): Promise<DocumentType<UserEntity> | null>;
  find(): Promise<DocumentType<UserEntity>[]>;
  verifyPassword(email: string, password: string, salt: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
