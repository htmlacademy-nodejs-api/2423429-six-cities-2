import { injectable } from 'inversify';
import { UserModel, UserDocument } from '../user/user.entity.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { Types } from 'mongoose';
import { UserType } from '../../types/index.js';

@injectable()
export class UserService {
  public async create(createUserDto: CreateUserDto): Promise<Types.ObjectId> {
    const user = new UserModel(createUserDto);
    await user.save();
    return user._id;
  }

  public async findByEmail(email: string): Promise<Types.ObjectId | null> {
    const user = await UserModel.findOne({ email }).exec();
    return user?._id || null;
  }

  public async getUserByEmail(email: string): Promise<UserDocument | null> {
    const user = await UserModel.findOne({ email }).exec();
    return user || null;
  }

  public async findOrCreate(userData: {
    name: string;
    email: string;
    password: string;
    type: UserType;
    avatar?: string;
  }): Promise<Types.ObjectId> {
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

    return this.create(createUserDto);
  }

  public async verifyPassword(email: string, password: string, salt: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return false;
    }
    return user.verifyPassword(password, salt);
  }
}
