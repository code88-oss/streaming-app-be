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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, email, password } = loginDto;

    // Kiểm tra identifier
    const identifier = username || email;
    if (!identifier) {
      throw new BadRequestException('Username or email is required');
    }

    // Tìm người dùng
    const user = await this.userService.findByEmailOrUsername(identifier);
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Tạo JWT token
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
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

  async generateTokens(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.refreshTokenService.create(userId);
    return { accessToken, refreshToken };
  }
}
