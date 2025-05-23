import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { RefreshTokenRepositoryInterface } from '../interfaces/refresh-token-repository.interface';
import { randomBytes } from 'crypto';
import { RefreshToken } from '../entities/refresh-token.entity';
import { REPOSITORY_TOKENS } from 'src/shared/constants/constants';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(REPOSITORY_TOKENS.REFRESH_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
  ) {}

  async create(userId: number, token: string, jti?: string): Promise<string> {
    const refreshToken = new RefreshToken();
    refreshToken.user_id = userId;
    refreshToken.token = token;
    refreshToken.jti = jti || uuidv4();
    refreshToken.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
    refreshToken.revoked = false;
    await this.refreshTokenRepository.create(refreshToken);
    return token;
  }

  async validate(token: string): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokenRepository.findByToken(token);
    if (
      !refreshToken ||
      refreshToken.expires_at < new Date() ||
      refreshToken.revoked
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return refreshToken;
  }

  async revoke(token: string): Promise<void> {
    await this.refreshTokenRepository.revoke(token);
  }
}
