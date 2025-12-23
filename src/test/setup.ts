// Setup file for Jest tests
// Sets up mock environment variables before tests run

process.env.TELEGRAM_BOT_TOKEN = 'test-telegram-token';
process.env.TELEGRAM_CHANNEL_ID = '@test-channel';
process.env.VK_ACCESS_TOKEN = 'test-vk-token';
process.env.VK_GROUP_ID = '123456789';
process.env.CACHE_SIZE = '20';
process.env.LOG_LEVEL = 'error'; // Use error level to suppress logs during tests
process.env.NODE_ENV = 'test';
