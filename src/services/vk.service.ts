import { VK } from 'vk-io';
import { config } from '../config';
import { logger } from '../utils/logger';
import { VKAPIError, retryAsync } from '../utils/errorHandler';

export class VKService {
  private vk: VK;

  constructor() {
    this.vk = new VK({
      token: config.vk.accessToken,
    });

    logger.info('VKService initialized', {
      groupId: config.vk.groupId,
    });
  }

  async publishPost(message: string): Promise<number> {
    try {
      const response = await retryAsync(
        async () => {
          return await this.vk.api.wall.post({
            owner_id: -config.vk.groupId,
            from_group: 1,
            message,
          });
        },
        3,
        1000,
        'VK wall.post'
      );

      logger.info('Post published to VK', {
        postId: response.post_id,
        messageLength: message.length,
      });

      return response.post_id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to publish post to VK', {
        error: errorMessage,
        messageLength: message.length,
      });

      throw new VKAPIError(`Failed to publish post: ${errorMessage}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.vk.api.groups.getById({
        group_id: config.vk.groupId.toString(),
      });

      logger.info('VK connection test successful');
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('VK connection test failed', { error: errorMessage });
      return false;
    }
  }
}
