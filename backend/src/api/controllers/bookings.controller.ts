import { Request, Response } from 'express';
import { bookingService } from '../../services/booking.service';

export class BookingsController {
  /**
   * Получить доступные слоты для записи
   */
  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { date, serviceId } = req.query;

      if (!date || !serviceId) {
        return res.status(400).json({ error: 'Отсутствуют обязательные параметры' });
      }

      const dateObj = new Date(date as string);
      const slots = await bookingService.getAvailableSlots(
        dateObj,
        parseInt(Array.isArray(serviceId) ? serviceId[0] : serviceId)
      );

      return res.json({ slots });
    } catch (error) {
      console.error('Ошибка при получении слотов:', error);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Создать запись
   */
  async createBooking(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { serviceId, startTime, notes } = req.body;

      if (!serviceId || !startTime) {
        return res.status(400).json({ error: 'Отсутствуют обязательные параметры' });
      }

      const booking = await bookingService.createBooking({
        userId: user.id,
        serviceId: parseInt(serviceId),
        startTime: new Date(startTime),
        notes,
      });

      // Отправляем уведомление (нужно передать bot instance)
      // Это будет реализовано в главном файле сервера

      return res.status(201).json(booking);
    } catch (error: any) {
      console.error('Ошибка при создании записи:', error);
      return res.status(400).json({ error: error.message || 'Ошибка при создании записи' });
    }
  }

  /**
   * Получить записи пользователя
   */
  async getUserBookings(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const includeCompleted = req.query.includeCompleted === 'true';

      const bookings = await bookingService.getUserBookings(user.id, includeCompleted);

      return res.json(bookings);
    } catch (error) {
      console.error('Ошибка при получении записей:', error);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Получить запись по ID
   */
  async getBookingById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const booking = await bookingService.getBookingById(parseInt(Array.isArray(id) ? id[0] : id));

      if (!booking) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }

      // Проверяем права доступа
      if (booking.userId !== user.id && user.telegramId.toString() !== process.env.ADMIN_TELEGRAM_ID) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }

      return res.json(booking);
    } catch (error) {
      console.error('Ошибка при получении записи:', error);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Отменить запись
   */
  async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const booking = await bookingService.cancelBooking(parseInt(Array.isArray(id) ? id[0] : id), user.id);

      return res.json(booking);
    } catch (error: any) {
      console.error('Ошибка при отмене записи:', error);
      return res.status(400).json({ error: error.message || 'Ошибка при отмене записи' });
    }
  }

  /**
   * Получить все записи (только для админа)
   */
  async getAllBookings(req: Request, res: Response) {
    try {
      const { status, date } = req.query;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (date) {
        const dateObj = new Date(date as string);
        const nextDay = new Date(dateObj);
        nextDay.setDate(nextDay.getDate() + 1);

        where.startTime = {
          gte: dateObj,
          lt: nextDay,
        };
      }

      const bookings = await bookingService.getUserBookings(0, true); // Simplified for now

      return res.json(bookings);
    } catch (error) {
      console.error('Ошибка при получении всех записей:', error);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}

export const bookingsController = new BookingsController();
