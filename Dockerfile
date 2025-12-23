# ---------- STAGE 1: BUILD ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем только package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости, включая dev
RUN npm ci

# Копируем весь исходный код
COPY . .

# Сборка приложения
RUN npm run build

# ---------- STAGE 2: PRODUCTION ----------
FROM node:18-alpine

WORKDIR /app

# Копируем node_modules и билд из builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production

# Команда запуска
CMD ["npm", "start"]
