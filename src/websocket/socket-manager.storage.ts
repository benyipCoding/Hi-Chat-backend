import { RedisService } from 'src/redis/redis.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketManagerStorage {
  constructor(private readonly redisService: RedisService) {}

  private getKey(userId: string) {
    return `sokcet-clients:socket-${userId}`;
  }

  insert(userId: string, socketId: string): Promise<'OK'> {
    return this.redisService.redisClient.set(
      this.getKey(userId),
      socketId,
      'EX',
      +process.env.REFRESH_TOKEN_TTL,
    );
  }

  remove(userId: string): Promise<number> {
    return this.redisService.redisClient.del(this.getKey(userId));
  }
}
