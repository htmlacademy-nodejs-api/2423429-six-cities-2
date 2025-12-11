import { prop, getModelForClass, modelOptions, defaultClasses } from '@typegoose/typegoose';
import { createSHA256, User as UserInterface, UserType } from '../../helpers/index.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UserEntity extends defaultClasses.TimeStamps implements UserInterface {
  @prop({ required: true })
  public name!: string;

  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: true, default: 'default-avatar.jpg' })
  public avatar!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ required: true, enum: UserType, default: UserType.Regular })
  public type!: UserType;

  public verifyPassword(password: string, salt: string): boolean {
    const hashedPassword = createSHA256(password, salt);
    return this.password === hashedPassword;
  }
}

export const UserModel = getModelForClass(UserEntity);
export type UserDocument = InstanceType<typeof UserModel>;
