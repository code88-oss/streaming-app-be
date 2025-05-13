import { RefreshToken } from '../entities/refresh-token.entity';

export interface RefreshTokenRepositoryInterface {
  findByToken(token: string): Promise<RefreshToken | null>;
  create(token: RefreshToken): Promise<RefreshToken>;
  revoke(token: string): Promise<void>;
}
