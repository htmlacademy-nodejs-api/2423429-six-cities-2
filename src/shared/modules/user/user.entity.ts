import { prop, getModelForClass, modelOptions, defaultClasses } from '@typegoose/typegoose';
import { User, UserType } from '../../helpers/index.js';

// Интерфейс для TypeScript
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface UserEntity extends defaultClasses.Base {}

// Декоратор для класса MongoDB
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
  public type!: UserType; // Должно быть type, а не userType!

  public setPassword(password: string, salt: string): void {
    // TODO: Реализовать хеширование пароля
    // Пока заглушка
    this.password = password;
  }

  public verifyPassword(password: string, salt: string): boolean {
    // TODO: Реализовать проверку пароля
    // Пока заглушка - всегда возвращает true
    return true;
  }
}

export const UserModel = getModelForClass(UserEntity);
export type UserDocument = InstanceType<typeof UserModel>;
