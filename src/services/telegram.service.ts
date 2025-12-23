import { Telegraf, Context } from 'telegraf';
import { Update, MessageEntity } from 'telegraf/types';
import { config } from '../config';
import { logger } from '../utils/logger';
import { buildTelegramPostLink } from '../utils/telegramLink';
import { CacheService } from './cache.service';
import { FormatterService } from './formatter.service';
import { VKService } from './vk.service';

export class TelegramService {
  private bot: Telegraf<Context<Update>>;
  private cacheService: CacheService;
  private formatterService: FormatterService;
  private vkService: VKService;

  constructor(
    cacheService: CacheService,
    formatterService: FormatterService,
    vkService: VKService
  ) {
    this.bot = new Telegraf(config.telegram.botToken);
    this.cacheService = cacheService;
    this.formatterService = formatterService;
    this.vkService = vkService;

    this.setupHandlers();

    logger.info('TelegramService initialized');
  }

  private setupHandlers(): void {
    this.bot.on('channel_post', async (ctx) => {
      await this.handleChannelPost(ctx);
    });

    this.bot.catch((err, ctx) => {
      logger.error('Telegram bot error', {
        error: err instanceof Error ? err.message : 'Unknown error',
        updateType: ctx.updateType,
      });
    });
  }

  private async handleChannelPost(
    ctx: Context<Update.ChannelPostUpdate>
  ): Promise<void> {
    const post = ctx.channelPost;

    logger.debug('Received channel post', {
      messageId: post.message_id,
      hasText: 'text' in post && !!post.text,
      hasCaption: 'caption' in post && !!post.caption,
      hasPhoto: 'photo' in post,
      hasVideo: 'video' in post,
      hasDocument: 'document' in post,
      hasAudio: 'audio' in post,
    });

    // Проверка на дубликаты
    if (this.cacheService.has(post.message_id)) {
      logger.debug('Skipping duplicate post', {
        messageId: post.message_id,
      });
      return;
    }

    try {
      // Извлекаем текст и entities из поста
      let text = '';
      let entities: MessageEntity[] | undefined;

      // Приоритет: text > caption > пустой текст
      if ('text' in post && post.text) {
        text = post.text;
        entities = post.entities;
      } else if ('caption' in post && post.caption) {
        text = post.caption;
        entities = (post as any).caption_entities;
      }

      logger.info('Processing channel post', {
        messageId: post.message_id,
        textLength: text.length,
        entitiesCount: entities?.length || 0,
        isMediaOnly: !text,
      });

      // Форматируем текст (если есть)
      let formattedText = text
        ? this.formatterService.convertToVK(text, entities)
        : '';

      // Добавляем ссылку на Telegram пост (если включено)
      if (config.telegram.includeTelegramLink) {
        const telegramLink = buildTelegramPostLink(
          config.telegram.channelId,
          post.message_id
        );

        if (telegramLink) {
          formattedText = this.formatterService.appendTelegramLink(
            formattedText,
            telegramLink
          );
        } else {
          logger.warn('Failed to build Telegram link, skipping', {
            messageId: post.message_id,
          });
        }
      }

      // Проверяем что есть что публиковать
      if (!formattedText.trim()) {
        logger.warn('Post has no content to publish', {
          messageId: post.message_id,
        });
        return;
      }

      // Публикуем в VK
      const vkPostId = await this.vkService.publishPost(formattedText);

      // Сохраняем в кеш
      this.cacheService.add(post.message_id);

      logger.info('Post processed successfully', {
        telegramMessageId: post.message_id,
        vkPostId,
        finalTextLength: formattedText.length,
      });
    } catch (error) {
      logger.error('Failed to process channel post', {
        messageId: post.message_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async start(): Promise<void> {
    logger.info('Starting Telegram bot...');

    try {
      await this.bot.launch();
      logger.info('Telegram bot started successfully');
    } catch (error) {
      logger.error('Failed to start Telegram bot', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async stop(): Promise<void> {
    logger.info('Stopping Telegram bot...');
    this.bot.stop();
    logger.info('Telegram bot stopped');
  }
}
