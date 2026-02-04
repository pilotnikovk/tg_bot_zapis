# Запуск с Docker

Самый простой способ запустить проект - использовать Docker Compose.

## Предварительные требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) установлен и запущен

## Быстрый старт

### 1. Проверьте настройки

Убедитесь, что в корневом файле `.env` указаны правильные значения:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_botfather
ADMIN_TELEGRAM_ID=ваш_telegram_id
TELEGRAM_BOT_USERNAME=имя_вашего_бота
```

### 2. Запустите все сервисы

```bash
docker-compose up
```

Или в фоновом режиме:

```bash
docker-compose up -d
```

### 3. Что произойдет

Docker автоматически:
- ✅ Скачает PostgreSQL образ
- ✅ Создаст базу данных
- ✅ Установит зависимости для backend и webapp
- ✅ Запустит миграции Prisma
- ✅ Заполнит БД тестовыми данными
- ✅ Запустит Backend на порту 8000
- ✅ Запустит WebApp на порту 3000

### 4. Доступ к сервисам

- **WebApp**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5433 (внешний порт)

### 5. Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только webapp
docker-compose logs -f webapp

# Только database
docker-compose logs -f db
```

## Остановка сервисов

```bash
# Остановить все контейнеры
docker-compose down

# Остановить и удалить volumes (очистит БД)
docker-compose down -v
```

## Перезапуск после изменений

### Изменения в коде

При изменении кода в `backend/src` или `webapp/src` изменения применяются автоматически благодаря hot reload.

### Изменения в package.json

Если добавили новые зависимости:

```bash
docker-compose down
docker-compose up --build
```

### Изменения в Prisma схеме

Если изменили `backend/prisma/schema.prisma`:

```bash
docker-compose exec backend npx prisma db push
docker-compose exec backend npx prisma generate
```

Или перезапустите backend:

```bash
docker-compose restart backend
```

## Полезные команды

### Подключиться к базе данных

```bash
docker-compose exec db psql -U postgres -d tgbot_zapis
```

### Выполнить команду в backend контейнере

```bash
docker-compose exec backend npm run prisma:studio
```

### Пересоздать базу данных

```bash
docker-compose down -v
docker-compose up -d db
docker-compose up backend webapp
```

## Отладка

### Проверить статус контейнеров

```bash
docker-compose ps
```

### Проверить здоровье БД

```bash
docker-compose exec db pg_isready -U postgres
```

### Войти в контейнер

```bash
# Backend
docker-compose exec backend sh

# WebApp
docker-compose exec webapp sh

# Database
docker-compose exec db sh
```

## Production Build

Для production сборки создайте отдельный `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Порт уже занят

Если порт 3000, 8000 или 5433 занят, измените порты в `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # вместо 3000:3000
```

### Контейнер не запускается

Проверьте логи:

```bash
docker-compose logs backend
```

### База данных не инициализируется

```bash
docker-compose down -v
docker-compose up -d db
# Подождите 10 секунд
docker-compose up backend webapp
```

### Очистить все и начать заново

```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

---

**Совет**: Используйте Docker Desktop для визуального мониторинга контейнеров, просмотра логов и управления ресурсами.
