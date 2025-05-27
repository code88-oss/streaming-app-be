// auth.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '../services/refresh-token.service';

interface AuthenticatedRequest extends Request {
  user: any; // hoặc bạn có thể dùng kiểu cụ thể nếu có (e.g. UserDto)
}

@Controller('auth')
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const user = req?.user;
    console.log('user', user);
    // Tạo user nếu cần, sau đó tạo JWT
    const tokens = await this.authService.handleOAuthLogin(user);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 3600 * 1000000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 3600 * 1000000,
    });

    // Redirect về frontend (Next.js)
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
}
