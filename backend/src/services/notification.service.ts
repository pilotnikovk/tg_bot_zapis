import { Bot } from 'grammy';
import prisma from '../database/prisma';
import { formatDateTime } from '../utils/date';
import { getBookingActionsKeyboard, getReviewKeyboard } from '../bot/keyboards';

export class NotificationService {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  /**
   * Отправить уведомление о новой записи
   */
  async sendBookingConfirmation(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
      },
    });

    if (!booking) return;

    const message =
      `✅ Ваша запись успешно создана!\n\n` +
      `📅 Дата и время: ${formatDateTime(booking.startTime)}\n` +
      `💅 Услуга: ${booking.service.name}\n` +
      `⏱ Длительность: ${booking.service.duration} мин\n` +
      `💰 Стоимость: ${booking.service.price} ₽\n\n` +
      `Мы отправим вам напоминание за 24 часа и за 2 часа до визита.\n\n` +
      `До встречи! 💖`;

    await this.bot.api.sendMessage(booking.user.telegramId.toString(), message);

    // Сохраняем уведомление в БД
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'BOOKING_CONFIRMED',
        message,
      },
    });
  }

  /**
   * Отправить напоминание за 24 часа
   */
  async send24HourReminder(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
      },
    });

    if (!booking || booking.status !== 'CONFIRMED') return;

    const message =
      `⏰ Напоминание о записи\n\n` +
      `Завтра у вас запись:\n` +
      `📅 ${formatDateTime(booking.startTime)}\n` +
      `💅 ${booking.service.name}\n\n` +
      `Если вам нужно перенести или отменить запись, сделайте это заранее.\n\n` +
      `Ждем вас! 💖`;

    await this.bot.api.sendMessage(booking.user.telegramId.toString(), message, {
      reply_markup: getBookingActionsKeyboard(booking.id),
    });

    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'BOOKING_REMINDER_24H',
        message,
      },
    });
  }

  /**
   * Отправить напоминание за 2 часа
   */
  async send2HourReminder(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
      },
    });

    if (!booking || booking.status !== 'CONFIRMED') return;

    const message =
      `⏰ Скоро ваша запись!\n\n` +
      `Через 2 часа у вас запись:\n` +
      `📅 ${formatDateTime(booking.startTime)}\n` +
      `💅 ${booking.service.name}\n\n` +
      `Не забудьте подготовиться к визиту.\n` +
      `До встречи! 💖`;

    await this.bot.api.sendMessage(booking.user.telegramId.toString(), message);

    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'BOOKING_REMINDER_2H',
        message,
      },
    });
  }

  /**
   * Отправить запрос на отзыв после посещения
   */
  async sendReviewRequest(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
      },
    });

    if (!booking || booking.status !== 'COMPLETED') return;

    // Проверяем, не оставлен ли уже отзыв
    const existingReview = await prisma.review.findUnique({
      where: { bookingId: booking.id },
    });

    if (existingReview) return;

    const message =
      `⭐ Как вам понравилось?\n\n` +
      `Спасибо, что посетили нас!\n\n` +
      `Будем благодарны за отзыв о нашей работе.\n` +
      `За отзыв с фото вы получите 50 бонусов! 🎁\n\n` +
      `Услуга: ${booking.service.name}`;

    await this.bot.api.sendMessage(booking.user.telegramId.toString(), message, {
      reply_markup: getReviewKeyboard(booking.id),
    });

    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'REVIEW_REQUEST',
        message,
      },
    });
  }

  /**
   * Уведомление о начислении бонусов
   */
  async sendBonusEarned(userId: number, amount: number, reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bonusAccount: true,
      },
    });

    if (!user) return;

    const message =
      `🎁 Вам начислены бонусы!\n\n` +
      `+ ${amount} бонусов\n` +
      `${reason}\n\n` +
      `Ваш баланс: ${user.bonusAccount?.balance || 0} бонусов\n\n` +
      `Используйте бонусы для оплаты следующих визитов!`;

    await this.bot.api.sendMessage(user.telegramId.toString(), message);

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'BONUS_EARNED',
        message,
      },
    });
  }

  /**
   * Уведомление о новой работе в галерее
   */
  async sendNewWorkNotification(userIds: number[], workExample: any) {
    const message =
      `✨ Новая работа в галерее!\n\n` +
      `${workExample.title}\n` +
      `${workExample.description || ''}\n\n` +
      `Смотрите в нашем боте! 💅`;

    for (const userId of userIds) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        await this.bot.api.sendMessage(user.telegramId.toString(), message);

        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'NEW_WORK_ADDED',
            message,
          },
        });
      }
    }
  }
}

export function createNotificationService(bot: Bot) {
  return new NotificationService(bot);
}
