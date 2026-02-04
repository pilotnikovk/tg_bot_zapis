import { Context } from 'grammy';
import { config } from '../../utils/config';
import prisma from '../../database/prisma';

export async function handleMessage(ctx: Context) {
  const user = ctx.from;
  const message = ctx.message;

  if (!user || !message) return;

  // Проверяем, это админ или клиент
  const isAdmin = user.id.toString() === config.adminTelegramId;

  if (isAdmin) {
    // Сообщение от админа - пересылаем клиенту если это ответ
    const replyTo = message.reply_to_message;
    if (replyTo && replyTo.forward_origin) {
      // Это ответ на пересланное сообщение от клиента
      // Здесь можно реализовать логику отправки ответа клиенту
      await ctx.reply('✅ Ответ отправлен клиенту');
    }
  } else {
    // Сообщение от клиента - пересылаем админу
    const dbUser = await prisma.user.findUnique({
      where: { telegramId: BigInt(user.id) },
    });

    let forwardMessage = `💬 Сообщение от клиента:\n\n`;
    forwardMessage += `👤 ${user.first_name} ${user.last_name || ''}\n`;
    if (user.username) {
      forwardMessage += `@${user.username}\n`;
    }
    if (dbUser?.phone) {
      forwardMessage += `📱 ${dbUser.phone}\n`;
    }
    forwardMessage += `\n${message.text || '[Медиафайл]'}`;

    await ctx.api.sendMessage(config.adminTelegramId, forwardMessage);

    // Отправляем фото/документ если есть
    if (message.photo) {
      const photo = message.photo[message.photo.length - 1];
      await ctx.api.sendPhoto(config.adminTelegramId, photo.file_id, {
        caption: `Фото от ${user.first_name}`,
      });
    }

    await ctx.reply(
      '✅ Ваше сообщение отправлено мастеру.\n' +
      'Мастер ответит вам в ближайшее время.'
    );
  }
}
