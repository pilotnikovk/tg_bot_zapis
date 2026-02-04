import { CommandContext, Context } from 'grammy';
import { config } from '../../utils/config';
import { getAdminKeyboard } from '../keyboards';

export async function handleAdmin(ctx: CommandContext<Context>) {
  const user = ctx.from;
  if (!user) return;

  // Проверяем, является ли пользователь админом
  if (user.id.toString() !== config.adminTelegramId) {
    await ctx.reply('❌ У вас нет доступа к админ-панели.');
    return;
  }

  const adminMessage = `
⚙️ Админ-панель

Добро пожаловать в панель управления!

Доступные функции:
• 📊 Статистика и аналитика
• 📝 Управление записями
• 💅 Управление услугами
• 🖼️ Управление галереей
• 👥 База клиентов
• ⚙️ Настройки бота`;

  await ctx.reply(adminMessage, {
    reply_markup: getAdminKeyboard(),
  });
}
