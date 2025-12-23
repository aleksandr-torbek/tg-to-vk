# /commit

Creates git commits using conventional commit format with appropriate emojis

## Usage

Generates properly formatted commit messages following conventional commit standards with emojis for better visualization. The commit type (feat, fix, etc.) should be in English, while the description should be in Russian.

**Important:** Do not add any attribution, watermarks, or signatures (such as "Generated with Claude Code" or similar) to commit messages. Keep messages clean and focused only on the actual change description.

## Format

- ✨ feat: Новый функционал
- 🐛 fix: Исправление ошибки
- 📚 docs: Документация
- 🎨 style: Стили кода
- ♻️ refactor: Рефакторинг кода
- ⚡ perf: Улучшение производительности
- ✅ test: Тесты
- 🔧 chore: Обслуживание

## Examples

```bash
git commit -m "✨ feat: Добавить новую команду для пользователей"
git commit -m "🐛 fix: Исправить ошибку в обработке сообщений"
git commit -m "📚 docs: Обновить README с новыми инструкциями"
```

## Guidelines

- Commit messages should be concise and descriptive
- Use only the emoji and format specified above
- Do not include any generated-by or tool attribution messages
- Keep the message focused purely on the change being committed
