import { UserOAuthProvider } from '../entities/user-oauth-provider.entity';

export interface UserOAuthProviderRepositoryInterface {
  findByProviderAndId(
    provider: string,
    providerId: string,
  ): Promise<UserOAuthProvider | null>;
  create(oauthProvider: UserOAuthProvider): Promise<UserOAuthProvider>;
}
