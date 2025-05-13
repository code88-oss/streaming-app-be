import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { UserOAuthProviderService } from '../../user/services/user-oauth-provider.service';

@Controller('auth/oauth')
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userOAuthProviderService: UserOAuthProviderService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const user = await this.userOAuthProviderService.findOrCreate(
      'google',
      req.user,
    );
    return this.authService.generateTokens(user.id, user.email);
  }
}
