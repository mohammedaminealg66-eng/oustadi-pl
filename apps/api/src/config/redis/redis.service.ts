import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    super(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    this.on('connect', () => this.logger.log('Connected to Redis'));
    this.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));

    this.connect().catch(() => this.logger.warn('Redis unavailable, running without cache'));
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
