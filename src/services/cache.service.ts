import { logger } from '../utils/logger';

export class CacheService {
  private cache: number[];
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.cache = [];
    this.maxSize = maxSize;
    logger.info('CacheService initialized', { maxSize });
  }

  add(messageId: number): void {
    if (this.cache.includes(messageId)) {
      logger.debug('Message already in cache', { messageId });
      return;
    }

    if (this.cache.length >= this.maxSize) {
      const removed = this.cache.shift();
      logger.debug('Cache size limit reached, removing oldest entry', {
        removed,
        messageId,
      });
    }

    this.cache.push(messageId);
    logger.debug('Added message to cache', {
      messageId,
      cacheSize: this.cache.length,
    });
  }

  has(messageId: number): boolean {
    return this.cache.includes(messageId);
  }

  clear(): void {
    const size = this.cache.length;
    this.cache = [];
    logger.info('Cache cleared', { previousSize: size });
  }

  getSize(): number {
    return this.cache.length;
  }

  getAll(): number[] {
    return [...this.cache];
  }
}
