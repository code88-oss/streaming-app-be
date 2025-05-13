import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RefreshTokenRepositoryInterface } from '../interfaces/refresh-token-repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RefreshTokenRepository implements RefreshTokenRepositoryInterface {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { token, revoked: false },
    });
  }

  async create(token: RefreshToken): Promise<RefreshToken> {
    return this.refreshTokenRepository.save(token);
  }

  async revoke(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { revoked: true });
  }
}
