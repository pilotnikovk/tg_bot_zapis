import { CallbackQueryContext, Context } from 'grammy';
import prisma from '../../database/prisma';
import { formatDateTime } from '../../utils/date';

export async function handleCallbacks(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;

  if (!data) return;

  // Подтверждение записи
  if (data.startsWith('confirm_booking_')) {
    const bookingId = parseInt(data.replace('confirm_booking_', ''));
    await confirmBooking(ctx, bookingId);
  }

  // Отмена записи
  else if (data.startsWith('cancel_booking_')) {
    const bookingId = parseInt(data.replace('cancel_booking_', ''));
    await cancelBooking(ctx, bookingId);
  }

  // Закрытие сообщения
  else if (data === 'close_message') {
    await ctx.deleteMessage();
  }

  // Админ статистика
  else if (data === 'admin_stats') {
    await showAdminStats(ctx);
  }

  // Записи на сегодня
  else if (data === 'admin_today') {
    await showTodayBookings(ctx);
  }

  await ctx.answerCallbackQuery();
}

async function confirmBooking(ctx: CallbackQueryContext<Context>, bookingId: number) {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: {
        user: true,
        service: true,
      },
    });

    await ctx.editMessageText(
      `✅ Запись подтверждена!\n\n` +
      `📅 ${formatDateTime(booking.startTime)}\n` +
      `💅 ${booking.service.name}\n` +
      `👤 ${booking.user.firstName} ${booking.user.lastName || ''}`
    );
  } catch (error) {
    await ctx.answerCallbackQuery({ text: '❌ Ошибка при подтверждении записи' });
  }
}

async function cancelBooking(ctx: CallbackQueryContext<Context>, bookingId: number) {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: {
        user: true,
        service: true,
      },
    });

    await ctx.editMessageText(
      `❌ Запись отменена\n\n` +
      `📅 ${formatDateTime(booking.startTime)}\n` +
      `💅 ${booking.service.name}\n` +
      `👤 ${booking.user.firstName} ${booking.user.lastName || ''}`
    );
  } catch (error) {
    await ctx.answerCallbackQuery({ text: '❌ Ошибка при отмене записи' });
  }
}

async function showAdminStats(ctx: CallbackQueryContext<Context>) {
  const stats = await prisma.booking.groupBy({
    by: ['status'],
    _count: true,
  });

  const totalBookings = await prisma.booking.count();
  const totalUsers = await prisma.user.count();

  let message = '📊 Статистика\n\n';
  message += `👥 Всего клиентов: ${totalUsers}\n`;
  message += `📝 Всего записей: ${totalBookings}\n\n`;
  message += 'По статусам:\n';

  stats.forEach((stat) => {
    const statusNames: Record<string, string> = {
      PENDING: '⏳ Ожидание',
      CONFIRMED: '✅ Подтверждено',
      COMPLETED: '✔️ Завершено',
      CANCELLED: '❌ Отменено',
    };
    message += `${statusNames[stat.status] || stat.status}: ${stat._count}\n`;
  });

  await ctx.editMessageText(message);
}

async function showTodayBookings(ctx: CallbackQueryContext<Context>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      startTime: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
    include: {
      user: true,
      service: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  if (bookings.length === 0) {
    await ctx.editMessageText('📅 На сегодня записей нет');
    return;
  }

  let message = '📅 Записи на сегодня:\n\n';
  bookings.forEach((booking, index) => {
    message += `${index + 1}. ${formatDateTime(booking.startTime)}\n`;
    message += `   ${booking.service.name}\n`;
    message += `   👤 ${booking.user.firstName} ${booking.user.lastName || ''}\n`;
    if (booking.user.phone) {
      message += `   📱 ${booking.user.phone}\n`;
    }
    message += `   ${booking.status === 'PENDING' ? '⏳ Ожидает' : '✅ Подтверждено'}\n\n`;
  });

  await ctx.editMessageText(message);
}
