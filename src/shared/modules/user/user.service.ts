import { injectable } from 'inversify';
import { UserModel, UserEntity } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserType } from '../../types/index.js';

@injectable()
export class UserService {
  public async create(dto: CreateUserDto): Promise<UserEntity> {
    const user = new UserModel(dto);
    return user.save();
  }

  public async findById(id: string): Promise<UserEntity | null> {
    return UserModel.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    return UserModel.findOne({ email }).exec();
  }

  public async findOrCreate(userData: {
    name: string;
    email: string;
    password: string;
    type: UserType; // Изменено: userType → type
    avatar?: string;
  }): Promise<UserEntity> {
    const existingUser = await this.findByEmail(userData.email);

    if (existingUser) {
      return existingUser;
    }

    // Создаем DTO с правильными аргументами
    const createUserDto = new CreateUserDto(
      userData.name,
      userData.email,
      userData.password,
      userData.type, // Изменено: userType → type
      userData.avatar || 'default-avatar.jpg'
    );

    return this.create(createUserDto);
  }

  public async verifyPassword(email: string, password: string, salt: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) {
      return false;
    }
    return user.verifyPassword?.(password, salt) ?? false;
  }
}
