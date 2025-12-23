import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

function validateConfig(): void {
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHANNEL_ID',
    'VK_ACCESS_TOKEN',
    'VK_GROUP_ID',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please copy .env.example to .env and fill in the values.'
    );
  }

  const groupId = parseInt(process.env.VK_GROUP_ID!, 10);
  if (isNaN(groupId)) {
    throw new Error('VK_GROUP_ID must be a valid number');
  }

  const cacheSize = parseInt(process.env.CACHE_SIZE || '20', 10);
  if (isNaN(cacheSize) || cacheSize < 1) {
    throw new Error('CACHE_SIZE must be a positive number');
  }
}

validateConfig();

export const config: Config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    channelId: process.env.TELEGRAM_CHANNEL_ID!,
    includeTelegramLink: process.env.INCLUDE_TELEGRAM_LINK === 'true',
  },
  vk: {
    accessToken: process.env.VK_ACCESS_TOKEN!,
    groupId: parseInt(process.env.VK_GROUP_ID!, 10),
  },
  app: {
    cacheSize: parseInt(process.env.CACHE_SIZE || '20', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};
