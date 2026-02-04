import { Bot } from 'grammy';
import { config } from '../utils/config';
import { handleStart } from './commands/start';
import { handleHelp } from './commands/help';
import { handleAdmin } from './commands/admin';
import { handleCallbacks } from './handlers/callbacks';
import { handleMessage } from './handlers/messages';

export function createBot() {
  const bot = new Bot(config.telegramBotToken);

  // Команды
  bot.command('start', handleStart);
  bot.command('help', handleHelp);
  bot.command('admin', handleAdmin);
  bot.command('mybookings', async (ctx) => {
    await ctx.reply('📋 Открываю ваши записи...', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📋 Мои записи',
              web_app: { url: `${config.webappUrl}/profile` },
            },
          ],
        ],
      },
    });
  });

  // Callback queries
  bot.on('callback_query:data', async (ctx) => {
    await handleCallbacks(ctx as any);
  });

  // Обработка текстовых сообщений
  bot.on('message:text', handleMessage);
  bot.on('message:photo', handleMessage);

  // Обработка ошибок
  bot.catch((err) => {
    console.error('Ошибка в боте:', err);
  });

  return bot;
}

export async function startBot() {
  const bot = createBot();

  // Устанавливаем команды бота
  await bot.api.setMyCommands([
    { command: 'start', description: 'Главное меню' },
    { command: 'mybookings', description: 'Мои записи' },
    { command: 'help', description: 'Помощь' },
    { command: 'admin', description: 'Админ-панель' },
  ]);

  // Запускаем бота
  await bot.start();
  console.log('✓ Бот успешно запущен');

  return bot;
}
