import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserOAuthProviderRepositoryInterface } from 'src/modules/user/interfaces/user-oauth-provider-repository.interface';
import { UserOAuthProvider } from 'src/modules/user/entities/user-oauth-provider.entity';

@Injectable()
export class UserOAuthProviderRepository
  implements UserOAuthProviderRepositoryInterface
{
  constructor(
    @InjectRepository(UserOAuthProvider)
    private readonly userOAuthProviderRepository: Repository<UserOAuthProvider>,
  ) {}

  async findByProviderAndId(provider: string, providerId: string) {
    return this.userOAuthProviderRepository.findOne({
      where: { provider, provider_id: providerId },
      relations: ['user'],
    });
  }

  async create(oauthProvider: UserOAuthProvider): Promise<UserOAuthProvider> {
    return this.userOAuthProviderRepository.save(oauthProvider);
  }
}
