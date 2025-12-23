import { logger } from './logger';

export class VKAPIError extends Error {
  constructor(message: string, public code?: number) {
    super(message);
    this.name = 'VKAPIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TelegramAPIError extends Error {
  constructor(message: string, public code?: number) {
    super(message);
    this.name = 'TelegramAPIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
  operationName = 'Operation'
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        const waitTime = delay * (i + 1);
        logger.warn(`${operationName} failed, retrying in ${waitTime}ms...`, {
          attempt: i + 1,
          maxRetries,
          error: lastError.message,
        });
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  logger.error(`${operationName} failed after ${maxRetries} attempts`, {
    error: lastError!.message,
  });

  throw lastError!;
}
