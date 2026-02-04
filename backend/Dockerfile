FROM node:18-slim

WORKDIR /app

# Установка OpenSSL для Prisma
RUN apt-get update -y && apt-get install -y openssl

# Build argument для DATABASE_URL (dummy для build time)
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dummy?schema=public
ENV DATABASE_URL=$DATABASE_URL

# Копируем package files
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Открываем порт
EXPOSE 8000

# Запуск приложения
CMD ["npm", "run", "dev"]
