import { User, UserType } from '../..';


export class UserEntity implements User {
  public name: string;
  public email: string;
  public avatar?: string | undefined;
  public password: string;
  public type: UserType;

}
