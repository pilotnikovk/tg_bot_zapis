import prisma from '../database/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class BonusService {
  /**
   * Получить или создать бонусный счет пользователя
   */
  async getOrCreateBonusAccount(userId: number) {
    let account = await prisma.bonusAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      account = await prisma.bonusAccount.create({
        data: {
          userId,
          balance: 0,
          totalEarned: 0,
        },
      });
    }

    return account;
  }

  /**
   * Начислить бонусы за запись
   */
  async earnBonusesForBooking(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
      },
    });

    if (!booking) {
      throw new Error('Запись не найдена');
    }

    // Получаем процент бонусов из настроек
    const bonusPercentageSetting = await prisma.settings.findUnique({
      where: { key: 'bonus_percentage' },
    });

    const bonusPercentage = bonusPercentageSetting
      ? parseFloat(bonusPercentageSetting.value)
      : 5;

    const bonusAmount = new Decimal(booking.service.price)
      .mul(bonusPercentage)
      .div(100);

    // Получаем или создаем бонусный счет
    const account = await this.getOrCreateBonusAccount(booking.userId);

    // Создаем транзакцию
    await prisma.bonusTransaction.create({
      data: {
        accountId: account.id,
        bookingId: booking.id,
        amount: bonusAmount,
        type: 'EARNED',
        reason: `Бонусы за посещение: ${booking.service.name}`,
      },
    });

    // Обновляем баланс
    await prisma.bonusAccount.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: bonusAmount,
        },
        totalEarned: {
          increment: bonusAmount,
        },
      },
    });

    return bonusAmount;
  }

  /**
   * Начислить бонусы за отзыв
   */
  async earnBonusesForReview(userId: number, _reviewId: number) {
    // Получаем сумму бонусов за отзыв из настроек
    const reviewBonusSetting = await prisma.settings.findUnique({
      where: { key: 'review_bonus' },
    });

    const bonusAmount = new Decimal(reviewBonusSetting?.value || '50');

    // Получаем или создаем бонусный счет
    const account = await this.getOrCreateBonusAccount(userId);

    // Создаем транзакцию
    await prisma.bonusTransaction.create({
      data: {
        accountId: account.id,
        amount: bonusAmount,
        type: 'BONUS',
        reason: 'Бонусы за отзыв с фото',
      },
    });

    // Обновляем баланс
    await prisma.bonusAccount.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: bonusAmount,
        },
        totalEarned: {
          increment: bonusAmount,
        },
      },
    });

    return bonusAmount;
  }

  /**
   * Списать бонусы
   */
  async spendBonuses(userId: number, amount: Decimal, bookingId?: number) {
    const account = await this.getOrCreateBonusAccount(userId);

    if (account.balance.lt(amount)) {
      throw new Error('Недостаточно бонусов на счету');
    }

    // Создаем транзакцию
    await prisma.bonusTransaction.create({
      data: {
        accountId: account.id,
        bookingId,
        amount: amount.neg(),
        type: 'SPENT',
        reason: 'Оплата бонусами',
      },
    });

    // Обновляем баланс
    await prisma.bonusAccount.update({
      where: { id: account.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    return account;
  }

  /**
   * Получить историю транзакций
   */
  async getTransactionHistory(userId: number, limit: number = 50) {
    const account = await this.getOrCreateBonusAccount(userId);

    const transactions = await prisma.bonusTransaction.findMany({
      where: {
        accountId: account.id,
      },
      include: {
        booking: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return transactions;
  }
}

export const bonusService = new BonusService();
