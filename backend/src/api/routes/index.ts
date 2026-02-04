import express from 'express';
import { servicesController } from '../controllers/services.controller';
import { bookingsController } from '../controllers/bookings.controller';
import { validateTelegramWebApp, requireAdmin } from '../middleware/auth';
import prisma from '../../database/prisma';

const router = express.Router();

// Публичные роуты
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Роуты для услуг
router.get('/services/categories', servicesController.getCategories);
router.get('/services', servicesController.getServices);
router.get('/services/:id', servicesController.getServiceById);

// Защищенные роуты (требуют авторизации через Telegram WebApp)
router.use(validateTelegramWebApp);

// Роуты для записей
router.get('/bookings/available-slots', bookingsController.getAvailableSlots);
router.post('/bookings', bookingsController.createBooking);
router.get('/bookings/my', bookingsController.getUserBookings);
router.get('/bookings/:id', bookingsController.getBookingById);
router.post('/bookings/:id/cancel', bookingsController.cancelBooking);

// Роуты для пользователя
router.get('/user/me', async (req, res) => {
  try {
    const user = (req as any).user;
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        bonusAccount: true,
      },
    });
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Роуты для галереи
router.get('/gallery', async (req, res) => {
  try {
    const examples = await prisma.workExample.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(examples);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Роуты для отзывов
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const user = (req as any).user;
    const { bookingId, rating, comment, photos } = req.body;

    // Проверяем, что запись принадлежит пользователю
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking || booking.userId !== user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Можно оставлять отзыв только на завершенные записи' });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        bookingId: parseInt(bookingId),
        rating: parseInt(rating),
        comment,
        photos: photos || null,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (error: any) {
    console.error('Ошибка при создании отзыва:', error);
    res.status(400).json({ error: error.message || 'Ошибка при создании отзыва' });
  }
});

// Роуты для бонусов
router.get('/bonuses/history', async (req, res) => {
  try {
    const user = (req as any).user;
    const account = await prisma.bonusAccount.findUnique({
      where: { userId: user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Админские роуты
router.use('/admin', requireAdmin);

router.post('/admin/services', servicesController.createService);
router.put('/admin/services/:id', servicesController.updateService);
router.delete('/admin/services/:id', servicesController.deleteService);

router.get('/admin/bookings', bookingsController.getAllBookings);

router.get('/admin/stats', async (req, res) => {
  try {
    const totalBookings = await prisma.booking.count();
    const totalUsers = await prisma.user.count();
    const totalRevenue = await prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: {
        service: {
          price: true,
        },
      },
    });

    res.json({
      totalBookings,
      totalUsers,
      totalRevenue: 0, // Нужна более сложная агрегация
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
