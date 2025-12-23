import { MessageEntity } from 'telegraf/types';

export interface TelegramPost {
  messageId: number;
  text: string;
  entities?: MessageEntity[];
  date: number;
}

export interface VKPost {
  message: string;
  ownerId: number;
}

export interface CacheEntry {
  messageId: number;
  timestamp: number;
}

export interface Config {
  telegram: {
    botToken: string;
    channelId: string;
    includeTelegramLink: boolean;
  };
  vk: {
    accessToken: string;
    groupId: number;
  };
  app: {
    cacheSize: number;
    logLevel: string;
    nodeEnv: string;
  };
}
