import { Request, Response } from 'express';
import prisma from '../../database/prisma';

export class ServicesController {
  /**
   * Получить все категории с услугами
   */
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.serviceCategory.findMany({
        include: {
          services: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      });

      res.json(categories);
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Получить все услуги
   */
  async getServices(req: Request, res: Response) {
    try {
      const services = await prisma.service.findMany({
        where: { isActive: true },
        include: {
          category: true,
        },
        orderBy: { order: 'asc' },
      });

      res.json(services);
    } catch (error) {
      console.error('Ошибка при получении услуг:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Получить услугу по ID
   */
  async getServiceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await prisma.service.findUnique({
        where: { id: parseInt(id) },
        include: {
          category: true,
        },
      });

      if (!service) {
        return res.status(404).json({ error: 'Услуга не найдена' });
      }

      res.json(service);
    } catch (error) {
      console.error('Ошибка при получении услуги:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Создать услугу (только для админа)
   */
  async createService(req: Request, res: Response) {
    try {
      const { name, description, duration, price, categoryId, order } = req.body;

      const service = await prisma.service.create({
        data: {
          name,
          description,
          duration: parseInt(duration),
          price,
          categoryId: parseInt(categoryId),
          order: order || 0,
        },
        include: {
          category: true,
        },
      });

      res.status(201).json(service);
    } catch (error) {
      console.error('Ошибка при создании услуги:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Обновить услугу (только для админа)
   */
  async updateService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, duration, price, categoryId, isActive, order } = req.body;

      const service = await prisma.service.update({
        where: { id: parseInt(id) },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(duration && { duration: parseInt(duration) }),
          ...(price && { price }),
          ...(categoryId && { categoryId: parseInt(categoryId) }),
          ...(isActive !== undefined && { isActive }),
          ...(order !== undefined && { order }),
        },
        include: {
          category: true,
        },
      });

      res.json(service);
    } catch (error) {
      console.error('Ошибка при обновлении услуги:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Удалить услугу (только для админа)
   */
  async deleteService(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Мягкое удаление - просто деактивируем
      await prisma.service.update({
        where: { id: parseInt(id) },
        data: { isActive: false },
      });

      res.json({ message: 'Услуга деактивирована' });
    } catch (error) {
      console.error('Ошибка при удалении услуги:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}

export const servicesController = new ServicesController();
