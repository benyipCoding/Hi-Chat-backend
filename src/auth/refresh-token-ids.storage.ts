import { Injectable } from '@nestjs/common';
// import { Redis } from 'ioredis';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RefreshTokenIdsStorage {
  constructor(private readonly redisService: RedisService) {}

  private getKey(userId: string): string {
    return `tokens:user-${userId}`;
  }

  async insert(userId: string, tokenId: string): Promise<void> {
    await this.redisService.redisClient.set(
      this.getKey(userId),
      tokenId,
      'EX',
      +process.env.REFRESH_TOKEN_TTL,
    );
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const existedTokenId = await this.getTokenId(userId);
    return existedTokenId === tokenId;
  }

  getTokenId(userId: string): Promise<string> {
    return this.redisService.redisClient.get(this.getKey(userId));
  }

  removeTokenId(userId: string): Promise<number> {
    return this.redisService.redisClient.del(this.getKey(userId));
  }
}
