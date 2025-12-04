import { UserType } from '../../../types/user.type.js';

export class CreateUserDto {
  public name: string;
  public email: string;
  public avatar?: string;
  public password: string;
  public type: UserType;

  constructor(
    name: string,
    email: string,
    password: string,
    type: UserType,
    avatar?: string
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.type = type;
    this.avatar = avatar;
  }
}
