import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { User, UserType } from '../../../types';

@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true
  }
})
export class UserEntity implements User {
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
    minlength: 6,
    maxlength: 12
  })
  public password!: string;

  @prop({
    required: true,
    enum: UserType,
    default: UserType.Regular
  })
  public type!: UserType;
}

export const UserModel = getModelForClass(UserEntity);
