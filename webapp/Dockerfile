FROM node:18-slim

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы
COPY . .

# Открываем порт
EXPOSE 3000

# Запуск приложения
CMD ["npm", "run", "dev"]
