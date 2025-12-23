import { config } from './config';
import { logger } from './utils/logger';
import { CacheService } from './services/cache.service';
import { FormatterService } from './services/formatter.service';
import { VKService } from './services/vk.service';
import { TelegramService } from './services/telegram.service';

class App {
  private telegramService: TelegramService;
  private vkService: VKService;

  constructor() {
    logger.info('Initializing application...', {
      nodeEnv: config.app.nodeEnv,
      cacheSize: config.app.cacheSize,
      logLevel: config.app.logLevel,
    });

    const cacheService = new CacheService(config.app.cacheSize);
    const formatterService = new FormatterService();
    this.vkService = new VKService();

    this.telegramService = new TelegramService(
      cacheService,
      formatterService,
      this.vkService
    );
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting application...');

      const vkConnectionOk = await this.vkService.testConnection();
      if (!vkConnectionOk) {
        throw new Error(
          'VK connection test failed. Please check VK_ACCESS_TOKEN and VK_GROUP_ID.'
        );
      }

      await this.telegramService.start();

      logger.info('Application started successfully');
      logger.info('Bot is now listening for channel posts...');
    } catch (error) {
      logger.error('Failed to start application', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    logger.info('Shutting down application...');

    try {
      await this.telegramService.stop();
      logger.info('Application stopped gracefully');
    } catch (error) {
      logger.error('Error during shutdown', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

const app = new App();

process.once('SIGINT', async () => {
  logger.info('Received SIGINT signal');
  await app.stop();
  process.exit(0);
});

process.once('SIGTERM', async () => {
  logger.info('Received SIGTERM signal');
  await app.stop();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
  process.exit(1);
});

app.start();
