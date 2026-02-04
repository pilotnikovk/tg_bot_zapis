import prisma from '../database/prisma';
import { addDuration, getDayStart, getDayEnd } from '../utils/date';
import { Prisma } from '@prisma/client';

export class BookingService {
  /**
   * Получить доступные слоты для записи
   */
  async getAvailableSlots(date: Date, serviceId: number) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error('Услуга не найдена');
    }

    // Получаем рабочие часы мастера
    const master = await prisma.master.findFirst({
      where: { isActive: true },
    });

    if (!master) {
      throw new Error('Мастер не найден');
    }

    // Определяем день недели
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const workHours = master.workHours as Record<string, { start: string; end: string } | null>;
    const todayWorkHours = workHours[dayOfWeek];

    if (!todayWorkHours || !todayWorkHours.start || !todayWorkHours.end) {
      return []; // Выходной день
    }

    // Получаем существующие записи на этот день
    const dayStart = getDayStart(date);
    const dayEnd = getDayEnd(date);

    const existingBookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: dayStart,
          lt: dayEnd,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    // Получаем заблокированные слоты
    const timeBlocks = await prisma.timeBlock.findMany({
      where: {
        startTime: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
    });

    // Генерируем все возможные слоты
    const slots: Date[] = [];
    const [startHour, startMinute] = todayWorkHours.start.split(':').map(Number);
    const [endHour, endMinute] = todayWorkHours.end.split(':').map(Number);

    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTime) {
      const slotEnd = addDuration(currentTime, service.duration);

      // Проверяем, не выходит ли слот за рабочее время
      if (slotEnd > endTime) break;

      // Проверяем, не занят ли слот
      const isOccupied = existingBookings.some((booking) => {
        return (
          (currentTime >= booking.startTime && currentTime < booking.endTime) ||
          (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
          (currentTime <= booking.startTime && slotEnd >= booking.endTime)
        );
      });

      // Проверяем блокировки
      const isBlocked = timeBlocks.some((block) => {
        return (
          (currentTime >= block.startTime && currentTime < block.endTime) ||
          (slotEnd > block.startTime && slotEnd <= block.endTime) ||
          (currentTime <= block.startTime && slotEnd >= block.endTime)
        );
      });

      if (!isOccupied && !isBlocked) {
        slots.push(new Date(currentTime));
      }

      // Переходим к следующему слоту (каждые 30 минут)
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }

    return slots;
  }

  /**
   * Создать запись
   */
  async createBooking(data: {
    userId: number;
    serviceId: number;
    startTime: Date;
    notes?: string;
  }) {
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      throw new Error('Услуга не найдена');
    }

    const endTime = addDuration(data.startTime, service.duration);

    // Проверяем, свободен ли слот
    const existingBooking = await prisma.booking.findFirst({
      where: {
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: data.startTime,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingBooking) {
      throw new Error('Это время уже занято');
    }

    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId,
        startTime: data.startTime,
        endTime,
        notes: data.notes,
        status: 'PENDING',
      },
      include: {
        service: true,
        user: true,
      },
    });

    return booking;
  }

  /**
   * Получить записи пользователя
   */
  async getUserBookings(userId: number, includeCompleted: boolean = false) {
    const where: Prisma.BookingWhereInput = {
      userId,
    };

    if (!includeCompleted) {
      where.status = {
        in: ['PENDING', 'CONFIRMED'],
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return bookings;
  }

  /**
   * Отменить запись
   */
  async cancelBooking(bookingId: number, userId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Запись не найдена');
    }

    if (booking.userId !== userId) {
      throw new Error('У вас нет прав на отмену этой записи');
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw new Error('Эту запись нельзя отменить');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: {
        service: true,
      },
    });

    return updatedBooking;
  }

  /**
   * Получить запись по ID
   */
  async getBookingById(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        user: true,
      },
    });

    return booking;
  }
}

export const bookingService = new BookingService();
