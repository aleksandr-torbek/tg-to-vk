import { MessageEntity } from 'telegraf/types';
import { FormatterService } from './formatter.service';

describe('FormatterService', () => {
  let formatter: FormatterService;

  beforeEach(() => {
    formatter = new FormatterService();
  });

  describe('Basic Formatting', () => {
    test('no entities - returns text unchanged', () => {
      const text = 'Plain text';
      const result = formatter.convertToVK(text);
      expect(result).toBe('Plain text');
    });

    test('empty entities array - returns text unchanged', () => {
      const text = 'Plain text';
      const result = formatter.convertToVK(text, []);
      expect(result).toBe('Plain text');
    });

    test('undefined entities - returns text unchanged', () => {
      const text = 'Plain text';
      const result = formatter.convertToVK(text, undefined);
      expect(result).toBe('Plain text');
    });

    test('bold entity - leaves text as-is (VK no support)', () => {
      const text = 'Hello bold world';
      const entities: MessageEntity[] = [
        {
          type: 'bold',
          offset: 6,
          length: 4,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello bold world');
    });

    test('italic entity - leaves text as-is', () => {
      const text = 'Hello italic world';
      const entities: MessageEntity[] = [
        {
          type: 'italic',
          offset: 6,
          length: 6,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello italic world');
    });

    test('underline entity - leaves text as-is', () => {
      const text = 'Hello underline world';
      const entities: MessageEntity[] = [
        {
          type: 'underline',
          offset: 6,
          length: 9,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello underline world');
    });

    test('strikethrough entity - leaves text as-is', () => {
      const text = 'Hello strike world';
      const entities: MessageEntity[] = [
        {
          type: 'strikethrough',
          offset: 6,
          length: 6,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello strike world');
    });

    test('spoiler entity - leaves text as-is', () => {
      const text = 'Hello spoiler world';
      const entities: MessageEntity[] = [
        {
          type: 'spoiler',
          offset: 6,
          length: 7,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello spoiler world');
    });
  });

  describe('Links', () => {
    test('text_link entity - formats as "text — url"', () => {
      const text = 'Check this link out';
      const entities: MessageEntity[] = [
        {
          type: 'text_link',
          offset: 6,
          length: 9,
          url: 'https://example.com',
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Check this link — https://example.com out');
    });

    test('text_link without url property - keeps text as-is', () => {
      const text = 'Check this link out';
      const entities: MessageEntity[] = [
        {
          type: 'text_link',
          offset: 6,
          length: 9,
        } as any,
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Check this link out');
    });

    test('url entity - keeps url as-is', () => {
      const text = 'Visit https://example.com today';
      const entities: MessageEntity[] = [
        {
          type: 'url',
          offset: 6,
          length: 19,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Visit https://example.com today');
    });

    test('multiple text_links - processes from end to start', () => {
      const text = 'First link and second link here';
      const entities: MessageEntity[] = [
        {
          type: 'text_link',
          offset: 0,
          length: 10,
          url: 'https://first.com',
        },
        {
          type: 'text_link',
          offset: 15,
          length: 11,
          url: 'https://second.com',
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe(
        'First link — https://first.com and second link — https://second.com here'
      );
    });
  });

  describe('Mentions', () => {
    test('mention entity - keeps @username as-is', () => {
      const text = 'Hello @username welcome';
      const entities: MessageEntity[] = [
        {
          type: 'mention',
          offset: 6,
          length: 9,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello @username welcome');
    });

    test('text_mention with username - formats with username', () => {
      const text = 'Hello John welcome';
      const entities: MessageEntity[] = [
        {
          type: 'text_mention',
          offset: 6,
          length: 4,
          user: {
            id: 123456,
            is_bot: false,
            first_name: 'John',
            username: 'johndoe',
          },
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello @johndoe welcome');
    });

    test('text_mention without username - formats with full name', () => {
      const text = 'Hello John welcome';
      const entities: MessageEntity[] = [
        {
          type: 'text_mention',
          offset: 6,
          length: 4,
          user: {
            id: 123456,
            is_bot: false,
            first_name: 'John',
            last_name: 'Doe',
          },
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello John Doe welcome');
    });

    test('text_mention with only first name', () => {
      const text = 'Hello John welcome';
      const entities: MessageEntity[] = [
        {
          type: 'text_mention',
          offset: 6,
          length: 4,
          user: {
            id: 123456,
            is_bot: false,
            first_name: 'John',
          },
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello John welcome');
    });

    test('text_mention without user data - keeps original text', () => {
      const text = 'Hello John welcome';
      const entities: MessageEntity[] = [
        {
          type: 'text_mention',
          offset: 6,
          length: 4,
        } as any,
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello John welcome');
    });
  });

  describe('Code Blocks', () => {
    test('code entity - wraps with backticks', () => {
      const text = 'Run console.log() to debug';
      const entities: MessageEntity[] = [
        {
          type: 'code',
          offset: 4,
          length: 13,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Run `console.log()` to debug');
    });

    test('pre entity without language - formats as code block', () => {
      const text = 'Code:\nfunction test() {\n  return 42;\n}';
      const entities: MessageEntity[] = [
        {
          type: 'pre',
          offset: 6,
          length: 33,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Code:\n```\nfunction test() {\n  return 42;\n}\n```');
    });

    test('pre entity with language - includes language inline', () => {
      const text = 'Code:\nfunction test() {\n  return 42;\n}';
      const entities: MessageEntity[] = [
        {
          type: 'pre',
          offset: 6,
          length: 33,
          language: 'javascript',
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe(
        'Code:\n```javascript\nfunction test() {\n  return 42;\n}\n```'
      );
    });

    test('pre entity with whitespace in language', () => {
      const text = 'Code:\nprint("hello")';
      const entities: MessageEntity[] = [
        {
          type: 'pre',
          offset: 6,
          length: 15,
          language: ' python ',
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Code:\n```python\nprint("hello")\n```');
    });
  });

  describe('Blockquote and Other Entities', () => {
    test('blockquote entity - leaves text as-is', () => {
      const text = 'Quote:\nLine one\nLine two';
      const entities: MessageEntity[] = [
        {
          type: 'blockquote',
          offset: 7,
          length: 17,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Quote:\nLine one\nLine two');
    });

    test('hashtag entity - keeps text as-is', () => {
      const text = 'Check out #trending topic';
      const entities: MessageEntity[] = [
        {
          type: 'hashtag',
          offset: 10,
          length: 9,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Check out #trending topic');
    });

    test('email entity - keeps text as-is', () => {
      const text = 'Contact us at test@example.com';
      const entities: MessageEntity[] = [
        {
          type: 'email',
          offset: 14,
          length: 16,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Contact us at test@example.com');
    });

    test('phone_number entity - keeps text as-is', () => {
      const text = 'Call +1234567890 now';
      const entities: MessageEntity[] = [
        {
          type: 'phone_number',
          offset: 5,
          length: 12,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Call +1234567890 now');
    });
  });

  describe('UTF-16 Handling', () => {
    test('emoji in text - handles UTF-16 offsets correctly', () => {
      const text = 'Hello 🔥 world';
      // "Hello " = 6 code units
      // "🔥" = 2 code units (surrogate pair)
      // " world" starts at offset 8
      const entities: MessageEntity[] = [
        {
          type: 'bold',
          offset: 8,
          length: 6, // " world"
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hello 🔥 world');
    });

    test('entity covering emoji - extracts emoji correctly', () => {
      const text = 'Fire 🔥 emoji';
      const entities: MessageEntity[] = [
        {
          type: 'code',
          offset: 5,
          length: 2, // The emoji (2 code units)
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Fire `🔥` emoji');
    });

    test('multiple emoji with entities', () => {
      const text = '🎉 Party 🎊 time';
      // "🎉" = 0-2
      // " Party " = 2-9
      // "🎊" = 9-11
      // " time" = 11-16
      const entities: MessageEntity[] = [
        {
          type: 'text_link',
          offset: 3,
          length: 5, // "Party"
          url: 'https://party.com',
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('🎉 Party — https://party.com 🎊 time');
    });

    test('cyrillic text with entities', () => {
      const text = 'Привет жирный мир';
      const entities: MessageEntity[] = [
        {
          type: 'bold',
          offset: 7,
          length: 7, // "жирный"
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Привет жирный мир');
    });
  });

  describe('Multiple Entities', () => {
    test('multiple non-overlapping entities - processes all correctly', () => {
      const text = 'Bold text and italic text and link text';
      const entities: MessageEntity[] = [
        { type: 'bold', offset: 0, length: 9 },
        { type: 'italic', offset: 14, length: 11 },
        {
          type: 'text_link',
          offset: 30,
          length: 9,
          url: 'https://example.com',
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Bold text and italic text and link text — https://example.com');
    });

    test('entities processed from end to start - order independence', () => {
      const text = 'First second third';
      const entities: MessageEntity[] = [
        { type: 'code', offset: 0, length: 5 }, // "First"
        { type: 'code', offset: 6, length: 6 }, // "second"
        { type: 'code', offset: 13, length: 5 }, // "third"
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('`First` `second` `third`');
    });

    test('entities in random order - still processed correctly', () => {
      const text = 'AAA BBB CCC';
      // Submit entities in non-sorted order
      const entities: MessageEntity[] = [
        { type: 'code', offset: 8, length: 3 }, // "CCC" - last
        { type: 'code', offset: 0, length: 3 }, // "AAA" - first
        { type: 'code', offset: 4, length: 3 }, // "BBB" - middle
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('`AAA` `BBB` `CCC`');
    });
  });

  describe('Edge Cases', () => {
    test('entity at start of text', () => {
      const text = 'Start with bold';
      const entities: MessageEntity[] = [
        {
          type: 'bold',
          offset: 0,
          length: 15,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Start with bold');
    });

    test('entity at end of text', () => {
      const text = 'End with bold';
      const entities: MessageEntity[] = [
        {
          type: 'bold',
          offset: 9,
          length: 4,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('End with bold');
    });

    test('entity covering entire text', () => {
      const text = 'Everything is bold';
      const entities: MessageEntity[] = [
        {
          type: 'bold',
          offset: 0,
          length: 18,
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Everything is bold');
    });

    test('empty text with no entities', () => {
      const text = '';
      const entities: MessageEntity[] = [];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('');
    });

    test('text with only whitespace', () => {
      const text = '   \n  \n  ';
      const entities: MessageEntity[] = [];
      const result = formatter.convertToVK(text, entities);
      // After trimming, should be empty
      expect(result).toBe('');
    });

    test('unknown entity type - keeps text and does not crash', () => {
      const text = 'Unknown entity here';
      const entities: MessageEntity[] = [
        {
          type: 'future_type' as any,
          offset: 8,
          length: 6,
        },
      ];
      // Should not crash, just keep text
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Unknown entity here');
    });
  });

  describe('Text Cleanup', () => {
    test('normalizes Windows line endings', () => {
      const text = 'Line one\r\nLine two\r\nLine three';
      const result = formatter.convertToVK(text);
      expect(result).toBe('Line one\nLine two\nLine three');
    });

    test('collapses multiple newlines to max 2', () => {
      const text = 'Paragraph 1\n\n\n\nParagraph 2';
      const result = formatter.convertToVK(text);
      expect(result).toBe('Paragraph 1\n\nParagraph 2');
    });

    test('trims whitespace from start and end', () => {
      const text = '  \n  Text with spaces  \n  ';
      const result = formatter.convertToVK(text);
      expect(result).toBe('Text with spaces');
    });
  });

  describe('Real-World Scenarios', () => {
    test('typical telegram post with multiple entity types', () => {
      const text = 'Check out Example.com for great deals! Use code SAVE20 🎉';
      const entities: MessageEntity[] = [
        {
          type: 'text_link',
          offset: 10,
          length: 11,
          url: 'https://example.com',
        },
        { type: 'code', offset: 48, length: 6 },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe(
        'Check out Example.com — https://example.com for great deals! Use code `SAVE20` 🎉'
      );
    });

    test('news post with link', () => {
      const text = 'Breaking news!\nRead more at link';
      const entities: MessageEntity[] = [
        { type: 'text_link', offset: 28, length: 4, url: 'https://news.com' },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Breaking news!\nRead more at link — https://news.com');
    });

    test('code snippet post', () => {
      const text = 'Here is the fix:\nconst x = 42;';
      const entities: MessageEntity[] = [
        {
          type: 'pre',
          offset: 17,
          length: 13,
          language: 'javascript',
        },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Here is the fix:\n```javascript\nconst x = 42;\n```');
    });

    test('post with mention and link', () => {
      const text = 'Hey @johndoe check out this link!';
      const entities: MessageEntity[] = [
        { type: 'mention', offset: 4, length: 8 },
        { type: 'text_link', offset: 28, length: 4, url: 'https://cool.site' },
      ];
      const result = formatter.convertToVK(text, entities);
      expect(result).toBe('Hey @johndoe check out this link — https://cool.site!');
    });
  });

  describe('appendTelegramLink', () => {
    test('appends link to non-empty text', () => {
      const text = 'Hello world';
      const link = 'https://t.me/channel/123';
      const result = formatter.appendTelegramLink(text, link);
      expect(result).toBe('Hello world\n\nИсточник: https://t.me/channel/123');
    });

    test('returns only link for empty text', () => {
      const text = '';
      const link = 'https://t.me/channel/456';
      const result = formatter.appendTelegramLink(text, link);
      expect(result).toBe('Источник: https://t.me/channel/456');
    });

    test('returns only link for whitespace-only text', () => {
      const text = '   \n  ';
      const link = 'https://t.me/channel/789';
      const result = formatter.appendTelegramLink(text, link);
      expect(result).toBe('Источник: https://t.me/channel/789');
    });

    test('handles text with existing newlines', () => {
      const text = 'Line 1\nLine 2';
      const link = 'https://t.me/c/123456/99';
      const result = formatter.appendTelegramLink(text, link);
      expect(result).toBe(
        'Line 1\nLine 2\n\nИсточник: https://t.me/c/123456/99'
      );
    });
  });
});
