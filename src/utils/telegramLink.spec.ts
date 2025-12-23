import { buildTelegramPostLink } from './telegramLink';

describe('telegramLink', () => {
  describe('buildTelegramPostLink', () => {
    test('public channel with @', () => {
      expect(buildTelegramPostLink('@mychannel', 123)).toBe(
        'https://t.me/mychannel/123'
      );
    });

    test('public channel without @', () => {
      expect(buildTelegramPostLink('mychannel', 456)).toBe(
        'https://t.me/mychannel/456'
      );
    });

    test('private channel with -100 prefix', () => {
      expect(buildTelegramPostLink('-1001234567890', 789)).toBe(
        'https://t.me/c/1234567890/789'
      );
    });

    test('private channel with - prefix only', () => {
      expect(buildTelegramPostLink('-1234567890', 101)).toBe(
        'https://t.me/c/1234567890/101'
      );
    });
  });
});
