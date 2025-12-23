import { MessageEntity } from 'telegraf/types';
import { logger } from '../utils/logger';

export class FormatterService {
  convertToVK(text: string, entities?: MessageEntity[]): string {
    let result = text;

    if (entities && entities.length > 0) {
      logger.debug('Converting text formatting', {
        textLength: text.length,
        entitiesCount: entities.length,
      });

      const sorted = [...entities].sort((a, b) => b.offset - a.offset);

      for (const entity of sorted) {
        const start = entity.offset;
        const end = entity.offset + entity.length;

        const entityText = this.sliceByUtf16(result, start, end);
        const formattedText = this.formatEntity(entityText, entity);

        result = this.replaceRange(result, start, end, formattedText);
      }

      logger.debug('Text formatting converted', {
        originalLength: text.length,
        resultLength: result.length,
      });
    }

    result = result
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return result;
  }

  /**
   * Добавляет ссылку на оригинальный Telegram пост в конец текста
   * @param text - форматированный текст поста
   * @param telegramLink - ссылка на пост в Telegram
   * @returns текст со ссылкой на источник
   */
  appendTelegramLink(text: string, telegramLink: string): string {
    // Если текст пустой, возвращаем только ссылку
    if (!text.trim()) {
      return `Источник: ${telegramLink}`;
    }

    // Добавляем ссылку через две пустые строки
    return `${text}\n\nИсточник: ${telegramLink}`;
  }

  private sliceByUtf16(text: string, start: number, end: number): string {
    return text.slice(start, end);
  }

  private replaceRange(
    text: string,
    start: number,
    end: number,
    replacement: string
  ): string {
    return text.slice(0, start) + replacement + text.slice(end);
  }

  private formatEntity(text: string, entity: MessageEntity): string {
    switch (entity.type) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strikethrough':
      case 'spoiler':
        return text;

      case 'text_link': {
        if ('url' in entity && entity.url) {
          return `${text} — ${entity.url}`;
        }
        return text;
      }

      case 'url':
        return text;

      case 'mention':
        return text;

      case 'text_mention': {
        if ('user' in entity && entity.user) {
          if (entity.user.username) {
            return `@${entity.user.username}`;
          }
          const nameParts = [
            entity.user.first_name,
            entity.user.last_name,
          ].filter(Boolean);
          const fullName = nameParts.join(' ').trim();
          return fullName || text;
        }
        return text;
      }

      case 'code':
        return `\`${text}\``;

      case 'pre': {
        const language = 'language' in entity && entity.language
          ? entity.language.trim()
          : '';
        const fenceHeader = language ? `\`\`\`${language}\n` : '```\n';
        return `${fenceHeader}${text}\n\`\`\``;
      }

      case 'blockquote':
        return text;

      case 'hashtag':
      case 'cashtag':
      case 'bot_command':
      case 'email':
      case 'phone_number':
        return text;

      case 'custom_emoji':
        return text;

      default: {
        const unknownEntity = entity as MessageEntity;
        logger.warn('Unknown entity type', {
          type: (unknownEntity).type,
          offset: unknownEntity.offset,
          length: unknownEntity.length,
        });
        return text;
      }
    }
  }
}
