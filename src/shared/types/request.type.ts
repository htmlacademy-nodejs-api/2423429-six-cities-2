import { TokenPayload } from './token-payload.interface.js';

declare module 'express' {
  export interface Request {
    user?: TokenPayload;
  }
}

export {};
