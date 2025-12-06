import { UserService } from './user-service.interface.js';
import { DocumentType } from '@typegoose/typegoose';
import { UserEntity, UserModel } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserType } from '../../types/index.js';

export class DefaultUserService implements UserService {
  public async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity();
    user.email = dto.email;
    user.name = dto.name;
    user.avatar = dto.avatar || 'default-avatar.jpg';
    user.type = dto.type;
    user.setPassword(dto.password, salt);

    return UserModel.create(user);
  }

  public async findById(id: string): Promise<DocumentType<UserEntity> | null> {
    return UserModel.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return UserModel.findOne({ email }).exec();
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
      return existingUser;
    }

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
      return false;
    }
    return user.verifyPassword(password, salt);
  }
}
