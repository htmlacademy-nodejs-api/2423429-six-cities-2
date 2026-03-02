import { JWTPayload } from 'jose';

export interface TokenPayload extends JWTPayload{
  userId: string;
  email: string;
  name: string;
  type: 'common' | 'pro';
}
