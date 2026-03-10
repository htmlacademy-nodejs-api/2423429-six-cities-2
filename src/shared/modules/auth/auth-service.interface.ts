import { TokenPayload } from '../../types/token-payload.interface.js';

export interface AuthService {
  authenticate(userId: string, email: string, name: string, type: 'common' | 'pro'): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
