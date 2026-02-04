import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './utils/config';
import { startBot } from './bot';
import apiRoutes from './api/routes';
import prisma from './database/prisma';

async function main() {
  try {
    // Валидация конфигурации
    validateConfig();
    console.log('✓ Конфигурация проверена');

    // Проверка подключения к БД
    await prisma.$connect();
    console.log('✓ Подключение к базе данных установлено');

    // Создаем Express приложение
    const app = express();

    // Middleware
    app.use(cors({
      origin: config.webappUrl,
      credentials: true,
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Логирование запросов в dev режиме
    if (config.nodeEnv === 'development') {
      app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
      });
    }

    // API Routes
    app.use('/api', apiRoutes);

    // Обработка ошибок
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Ошибка сервера:', err);
      res.status(500).json({
        error: config.nodeEnv === 'development' ? err.message : 'Внутренняя ошибка сервера',
      });
    });

    // Запускаем сервер
    const server = app.listen(config.port, () => {
      console.log(`✓ API сервер запущен на порту ${config.port}`);
      console.log(`  URL: http://localhost:${config.port}`);
    });

    // Запускаем Telegram бота
    const bot = await startBot();
    console.log('✓ Telegram бот запущен');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⏸ Получен сигнал SIGINT, завершаем работу...');

      server.close(() => {
        console.log('✓ API сервер остановлен');
      });

      await bot.stop();
      console.log('✓ Бот остановлен');

      await prisma.$disconnect();
      console.log('✓ Отключение от БД');

      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n⏸ Получен сигнал SIGTERM, завершаем работу...');

      server.close(() => {
        console.log('✓ API сервер остановлен');
      });

      await bot.stop();
      console.log('✓ Бот остановлен');

      await prisma.$disconnect();
      console.log('✓ Отключение от БД');

      process.exit(0);
    });

  } catch (error) {
    console.error('Ошибка при запуске приложения:', error);
    process.exit(1);
  }
}

main();
