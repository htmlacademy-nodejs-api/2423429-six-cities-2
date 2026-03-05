import { inject, injectable } from 'inversify';
import { SignJWT, jwtVerify } from 'jose';
import { AuthService } from './auth-service.interface.js';
import { TokenPayload } from '../../types/token-payload.interface.js';
import { Component } from '../../types/component.enum.js';
import { Logger } from '../../libs/logger/index.js';
import { Config } from '../../libs/config/index.js';
import { RestSchema } from '../../libs/config/rest.schema.js';

@injectable()
export class JWTAuthService implements AuthService {
  private readonly secretKey: Uint8Array;
  private readonly algorithm: string;
  private readonly expiresIn: string;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
  ) {
    const secret = this.config.get('JWT_SECRET');
    this.secretKey = new TextEncoder().encode(secret);
    this.algorithm = this.config.get('JWT_ALGORITHM');
    this.expiresIn = this.config.get('JWT_EXPIRES_IN');
  }

  public async authenticate(
    userId: string,
    email: string,
    name: string,
    type: 'common' | 'pro'
  ): Promise<string> {
    const tokenPayload: TokenPayload = {
      userId,
      email,
      name,
      type
    };

    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: this.algorithm })
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secretKey);

    this.logger.info(`JWT created for user: ${email}`);
    return token;
  }

  public async verify(token: string): Promise<TokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey, {
        algorithms: [this.algorithm]
      });

      return payload as TokenPayload;
    } catch (error) {
      this.logger.error('JWT verification failed', error as Error);
      throw new Error('Invalid token');
    }
  }
}
