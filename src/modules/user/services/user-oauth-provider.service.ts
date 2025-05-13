import { Inject, Injectable } from '@nestjs/common';
import { UserOAuthProviderRepositoryInterface } from '../interfaces/user-oauth-provider-repository.interface';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { randomBytes } from 'crypto';
import { UserOAuthProvider } from '../entities/user-oauth-provider.entity';
import { REPOSITORY_TOKENS } from 'src/shared/constants/constants';

@Injectable()
export class UserOAuthProviderService {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER_OAUTH)
    private readonly userOAuthProviderRepository: UserOAuthProviderRepositoryInterface,
    private readonly userService: UserService,
  ) {}

  async findOrCreate(provider: string, profile: any): Promise<User> {
    let userOAuthProvider =
      await this.userOAuthProviderRepository.findByProviderAndId(
        provider,
        profile.id,
      );
    if (userOAuthProvider) {
      return this.userService.findById(userOAuthProvider.user_id);
    }

    const user = await this.userService.create({
      email: profile.emails[0].value,
      password: randomBytes(16).toString('hex'), // Random password for OAuth users
      name: profile.displayName,
    });

    const oauthProvider = new UserOAuthProvider();
    oauthProvider.user_id = user.id;
    oauthProvider.provider = provider;
    oauthProvider.provider_id = profile.id;

    await this.userOAuthProviderRepository.create(oauthProvider);
    return user;
  }
}
