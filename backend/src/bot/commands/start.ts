import { CommandContext, Context } from 'grammy';
import { getMainKeyboard } from '../keyboards';
import prisma from '../../database/prisma';

export async function handleStart(ctx: CommandContext<Context>) {
  const user = ctx.from;
  if (!user) return;

  // Сохраняем/обновляем пользователя в БД
  await prisma.user.upsert({
    where: { telegramId: BigInt(user.id) },
    update: {
      firstName: user.first_name,
      lastName: user.last_name || null,
      username: user.username || null,
    },
    create: {
      telegramId: BigInt(user.id),
      firstName: user.first_name,
      lastName: user.last_name || null,
      username: user.username || null,
    },
  });

  const welcomeMessage = `
👋 Добро пожаловать, ${user.first_name}!

Я - бот для записи к мастеру маникюра и педикюра.

🌟 Что я умею:
• 📅 Запись на услуги в удобное время
• 💅 Галерея работ и портфолио
• 🎁 Бонусная система за каждое посещение
• 📝 История ваших записей
• ⭐ Отзывы с фотографиями
• 🔔 Напоминания о записях

Выберите действие:`;

  await ctx.reply(welcomeMessage, {
    reply_markup: getMainKeyboard(),
  });
}
