import { prop, getModelForClass, modelOptions, defaultClasses } from '@typegoose/typegoose';
import { createSHA256, User, UserType } from '../../helpers/index.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UserEntity extends defaultClasses.TimeStamps implements User {
  @prop({ required: true })
  public name!: string;

  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: true })
  public avatar!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ required: true, enum: UserType })
  public type!: UserType;

  public setPassword(password: string, salt: string): void {
    this.password = createSHA256(password, salt);
  }

  public verifyPassword(password: string, salt: string): boolean {
    const hashedPassword = createSHA256(password, salt);
    return this.password === hashedPassword;
  }
}

export const UserModel = getModelForClass(UserEntity);
export type UserDocument = InstanceType<typeof UserModel>;
