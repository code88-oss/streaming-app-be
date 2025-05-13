import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { OAuthController } from './controllers/oauth.controller';
import { AuthService } from './services/auth.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserModule } from '../user/user.module';
import * as dotenv from 'dotenv';
import { AuthController } from './controllers/auth.controllers';
import { REPOSITORY_TOKENS } from 'src/shared/constants/constants';
import { UserOAuthProviderService } from '../user/services/user-oauth-provider.service';
import { UserOAuthProviderRepository } from './repositories/user-oauth-provider.repository';
import { UserOAuthProvider } from '../user/entities/user-oauth-provider.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, UserOAuthProvider]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    UserModule,
  ],
  controllers: [AuthController, OAuthController],
  providers: [
    AuthService,
    RefreshTokenService,
    UserOAuthProviderService,
    {
      provide: REPOSITORY_TOKENS.REFRESH_TOKEN,
      useClass: RefreshTokenRepository,
    },
    {
      provide: REPOSITORY_TOKENS.USER_OAUTH,
      useClass: UserOAuthProviderRepository,
    },
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
