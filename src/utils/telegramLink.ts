import { logger } from './logger';

/**
 * Формирует ссылку на пост в Telegram канале
 * @param channelId - ID или username канала (из конфига)
 * @param messageId - ID сообщения
 * @returns URL ссылка на пост или null если не удалось сформировать
 */
export function buildTelegramPostLink(
  channelId: string,
  messageId: number
): string | null {
  try {
    // Публичный канал с username (начинается с @)
    if (channelId.startsWith('@')) {
      const username = channelId.substring(1); // убираем @
      return `https://t.me/${username}/${messageId}`;
    }

    // Приватный канал с числовым ID (формат -100XXXXXXXXX)
    if (channelId.startsWith('-100')) {
      const cleanId = channelId.substring(4); // убираем -100
      return `https://t.me/c/${cleanId}/${messageId}`;
    }

    // Числовой ID без префикса -100 (старый формат)
    if (channelId.startsWith('-')) {
      const numericId = channelId.substring(1);
      return `https://t.me/c/${numericId}/${messageId}`;
    }

    // Username без @
    return `https://t.me/${channelId}/${messageId}`;
  } catch (error) {
    logger.error('Failed to build Telegram post link', {
      channelId,
      messageId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}
