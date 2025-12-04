import { prop, getModelForClass, modelOptions, defaultClasses } from '@typegoose/typegoose';
import { CreateUserDto } from './dto/create-user.dto.js';
import { createSHA256, User, UserType } from '../../helpers/index.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface UserEntity extends defaultClasses.Base {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UserEntity extends defaultClasses.TimeStamps implements User {
  @prop({
    required: true,
    minlength: 1,
    maxlength: 15
  })
  public name!: string;

  @prop({
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  })
  public email!: string;

  @prop({
    default: 'default-avatar.jpg'
  })
  public avatar?: string;

  @prop({
    required: true,
    default: ''
  })
  public password!: string;

  @prop({
    required: true,
    enum: UserType,
    default: UserType.Regular
  })
  public type!: UserType;

  constructor(userData: CreateUserDto) {
    super();

    this.email = userData.email;
    this.name = userData.name;
    this.avatar = userData.avatar;
    this.type = userData.type;

    // Временно, потом добавим соль из конфига
    this.setPassword(userData.password, 'default-salt');
  }

  public setPassword(password: string, salt: string): void {
    this.password = createSHA256(password, salt);
  }

  public getPassword(): string {
    return this.password;
  }

  public verifyPassword(password: string, salt: string): boolean {
    const hashedPassword = createSHA256(password, salt);
    return this.password === hashedPassword;
  }
}

export const UserModel = getModelForClass(UserEntity);
export type UserDocument = InstanceType<typeof UserModel>;
