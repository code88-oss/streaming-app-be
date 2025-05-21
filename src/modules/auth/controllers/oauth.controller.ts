// auth.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

interface AuthenticatedRequest extends Request {
  user: any; // hoặc bạn có thể dùng kiểu cụ thể nếu có (e.g. UserDto)
}

@Controller('auth')
export class OAuthController {
  constructor(private readonly authService: AuthService) {}

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

    // Tạo user nếu cần, sau đó tạo JWT
    const tokens = await this.authService.handleOAuthLogin(user);

    // Tuỳ bạn: gắn cookie hoặc redirect kèm access token
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 3600 * 1000,
    });

    // Redirect về frontend (Next.js)
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
}
