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
import { v4 as uuidv4 } from 'uuid';

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

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
      user.username,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const token = await this.refreshTokenService.validate(refreshToken);

    const user = token.user;

    const accessPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      token_type: 'access',
      scope: 'read:all',
      jti: uuidv4(),
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: '15m',
      secret: process.env.JWT_ACCESS_SECRET,
    });

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
    console.log('id', googleUser.id);
    const user = await this.userOAuthProviderService.findOrCreate('google', {
      id: googleUser.id,
      emails: [{ value: googleUser.email }],
      displayName: googleUser.displayName,
    });

    return this.generateTokens(user.id, user.email, user.username); // Access + Refresh Token
  }

  async generateTokens(
    userId: string,
    email: string,
    username: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Tạo payload cho access token
    const accessPayload = {
      sub: userId,
      email,
      username,
      token_type: 'access',
      scope: 'read:all',
      jti: uuidv4(),
    };

    // Tạo payload cho refresh token
    const refreshPayload = {
      sub: userId,
      email,
      username,
      token_type: 'refresh',
      jti: uuidv4(),
    };

    // Tạo access token
    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: '15m',
      secret: process.env.JWT_ACCESS_SECRET,
    });

    // Tạo refresh token
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    // Lưu refresh token vào DB
    await this.refreshTokenService.create(
      userId,
      refreshToken,
      refreshPayload.jti,
    );

    return { accessToken, refreshToken };
  }
}
