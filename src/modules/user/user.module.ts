import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserOAuthProviderService } from './services/user-oauth-provider.service';
import { User } from './entities/user.entity';
import { UserOAuthProvider } from './entities/user-oauth-provider.entity';
import { UserRepository } from './repositories/user.repository';
import { UserOAuthProviderRepository } from '../auth/repositories/user-oauth-provider.repository';
import { REPOSITORY_TOKENS } from 'src/shared/constants/constants';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserOAuthProvider])],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: REPOSITORY_TOKENS.USER,
      useClass: UserRepository,
    },
    {
      provide: REPOSITORY_TOKENS.USER_OAUTH,
      useClass: UserOAuthProviderRepository,
    },
    UserOAuthProviderService,
  ],
  exports: [UserService, UserOAuthProviderService],
})
export class UserModule {}
