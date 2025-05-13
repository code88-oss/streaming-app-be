import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { RefreshTokenRepositoryInterface } from '../interfaces/refresh-token-repository.interface';
import { randomBytes } from 'crypto';
import { RefreshToken } from '../entities/refresh-token.entity';
import { REPOSITORY_TOKENS } from 'src/shared/constants/constants';

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(REPOSITORY_TOKENS.REFRESH_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
  ) {}

  async create(userId: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const refreshToken = new RefreshToken();
    refreshToken.user_id = userId;
    refreshToken.token = token;
    refreshToken.expires_at = expiresAt;
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
