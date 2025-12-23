# Telegram to VK Bot

Автоматическая трансляция постов из Telegram канала в группу VK с сохранением форматирования.

## Возможности

- Автоматическая публикация текстовых постов из Telegram в VK
- Сохранение форматирования: **жирный**, *курсив*, __подчеркнутый__, ссылки
- In-memory кеш для предотвращения дубликатов (настраиваемый размер)
- Graceful shutdown
- Структурированное логирование
- Type-safe конфигурация

## Требования

- Node.js >= 18.0.0
- npm или yarn
- Telegram бот токен (от @BotFather)
- VK access token с правами на публикацию в группе

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd tg-to-vk
```

2. Установите зависимости:
```bash
npm install
```

3. Скопируйте `.env.example` в `.env` и заполните переменные:
```bash
cp .env.example .env
```

## Настройка

### 1. Получение Telegram Bot Token

1. Напишите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям и получите токен
4. Добавьте бота в ваш канал как администратора с правами "Post messages"

### 2. Получение VK Access Token

1. Перейдите в настройки вашей VK группы
2. Настройки → API usage → Ключи доступа
3. Создайте ключ с правами на "Управление сообществом"
4. Скопируйте токен

### 3. Настройка .env файла

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...    # Токен от BotFather
TELEGRAM_CHANNEL_ID=@your_channel       # Username канала или ID

# VK
VK_ACCESS_TOKEN=vk1.a.xxxx...           # Токен из настроек группы
VK_GROUP_ID=123456789                   # ID группы (без минуса)

# Settings
CACHE_SIZE=20                           # Количество постов в кеше
LOG_LEVEL=info                          # debug | info | warn | error
NODE_ENV=development                    # development | production
```

## Запуск

### Development режим

```bash
npm run dev
```

Бот будет перезапускаться автоматически при изменении кода.

### Production режим

```bash
# Сборка
npm run build

# Запуск
npm start
```

### Docker деплой

```bash
# Сборка образа
docker build -t tg-to-vk .

# Запуск контейнера
docker run -d --env-file .env --name tg-to-vk tg-to-vk
```

Подробные инструкции по production деплою доступны в приватном репозитории.

## Структура проекта

```
tg-to-vk/
├── src/
│   ├── index.ts                    # Entry point
│   ├── config/
│   │   └── index.ts                # Конфигурация
│   ├── services/
│   │   ├── telegram.service.ts     # Telegram бот
│   │   ├── vk.service.ts           # VK API
│   │   ├── formatter.service.ts    # Конвертация форматирования
│   │   └── cache.service.ts        # Кеш постов
│   ├── types/
│   │   └── index.ts                # TypeScript интерфейсы
│   └── utils/
│       ├── logger.ts               # Логирование
│       └── errorHandler.ts         # Обработка ошибок
├── .env                            # Конфигурация (не в git)
├── .env.example                    # Пример конфигурации
├── tsconfig.json                   # TypeScript конфигурация
└── package.json
```

## Форматирование текста

Бот конвертирует следующие форматы из Telegram в VK:

| Telegram | VK | Описание |
|----------|-----|----------|
| `**text**` | `**text**` | Жирный |
| `*text*` | `*text*` | Курсив |
| `__text__` | `__text__` | Подчеркнутый |
| `[text](url)` | `[url\|text]` | Ссылка |
| `` `code` `` | `` `code` `` | Код |
| `~text~` | `~text~` | Зачеркнутый |

## Логирование

Логи выводятся в консоль с цветным форматированием:

- `DEBUG` - детальная информация для отладки
- `INFO` - общая информация о работе бота
- `WARN` - предупреждения
- `ERROR` - ошибки

В production режиме логи также сохраняются в файлы:
- `logs/error.log` - только ошибки
- `logs/combined.log` - все логи

## Скрипты

```bash
npm run dev          # Запуск в dev режиме с hot reload
npm run build        # Сборка TypeScript → JavaScript
npm start            # Запуск production версии
npm run lint         # Проверка кода ESLint
npm run lint:fix     # Автоисправление ESLint
npm run format       # Форматирование кода Prettier
```

## Troubleshooting

### Бот не получает посты из канала

1. Убедитесь, что бот добавлен в канал как администратор
2. Проверьте, что у бота есть права "Post messages"
3. Убедитесь, что `TELEGRAM_CHANNEL_ID` указан правильно

### Ошибка VK API

1. Проверьте, что токен VK имеет права на публикацию
2. Убедитесь, что `VK_GROUP_ID` указан без минуса
3. Проверьте, что токен не истек

### Посты дублируются

Кеш хранится в памяти и очищается при перезапуске. Для persistence в будущих версиях будет добавлена поддержка БД.

## Roadmap

- [ ] Поддержка медиа (фото, видео, документы)
- [ ] Persistent cache (SQLite/Redis)
- [ ] Queue system для rate limiting
- [ ] Поддержка нескольких каналов
- [ ] Admin команды через Telegram
- [ ] Расширенное покрытие тестами

## Лицензия

MIT

---
*Автоматически синхронизируется с приватным репозиторием для деплоя*