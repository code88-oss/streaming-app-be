import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from './refresh-token.service';
import { LoginDto } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from 'src/shared/constants/constants';
import { UserOAuthProviderService } from 'src/modules/user/services/user-oauth-provider.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userOAuthProviderService: UserOAuthProviderService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, email, password } = loginDto;
    const identifier = username || email;

    if (!identifier) {
      throw new BadRequestException('Username or email is required');
    }

    const user = await this.userService.findByEmailOrUsername(identifier);
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // ✅ Tạo payload
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    // ✅ Tạo access token (15 phút)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // ✅ Tạo refresh token (7 ngày)
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // ✅ Lưu refresh token vào DB
    await this.refreshTokenService.create(user.id, refreshToken); // ⚠️ nhớ sửa hàm create để nhận cả token

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email },
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const token = await this.refreshTokenService.validate(refreshToken);
    const user = await this.userService.findById(token.user_id);
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    return { accessToken };
  }
  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revoke(refreshToken);
  }

  async handleOAuthLogin(googleUser: {
    id: string;
    email: string;
    displayName: string;
  }) {
    const user = await this.userOAuthProviderService.findOrCreate('google', {
      id: googleUser.id,
      emails: [{ value: googleUser.email }],
      displayName: googleUser.displayName,
    });

    return this.generateTokens(user.id, user.email); // Access + Refresh Token
  }

  async generateTokens(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.refreshTokenService.create(
      userId,
      accessToken,
    );
    return { accessToken, refreshToken };
  }
}
