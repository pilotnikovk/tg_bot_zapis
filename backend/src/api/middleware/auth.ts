import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../utils/config';
import prisma from '../../database/prisma';

interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  auth_date: number;
  hash: string;
}

/**
 * Middleware для проверки Telegram WebApp данных
 */
export async function validateTelegramWebApp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      return res.status(401).json({ error: 'Отсутствуют данные авторизации' });
    }

    // Парсим данные
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    if (!hash) {
      return res.status(401).json({ error: 'Отсутствует hash' });
    }

    // Создаем строку для проверки
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Вычисляем secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegramBotToken)
      .digest();

    // Вычисляем hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Проверяем hash
    if (calculatedHash !== hash) {
      return res.status(401).json({ error: 'Неверные данные авторизации' });
    }

    // Парсим данные пользователя
    const userStr = params.get('user');
    if (!userStr) {
      return res.status(401).json({ error: 'Отсутствуют данные пользователя' });
    }

    const userData = JSON.parse(userStr);

    // Получаем или создаем пользователя
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(userData.id) },
      update: {
        firstName: userData.first_name,
        lastName: userData.last_name || null,
        username: userData.username || null,
      },
      create: {
        telegramId: BigInt(userData.id),
        firstName: userData.first_name,
        lastName: userData.last_name || null,
        username: userData.username || null,
      },
    });

    // Добавляем пользователя в request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Ошибка валидации Telegram WebApp:', error);
    return res.status(401).json({ error: 'Ошибка авторизации' });
  }
}

/**
 * Middleware для проверки прав администратора
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  if (user.telegramId.toString() !== config.adminTelegramId) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }

  next();
}

/**
 * Генерация JWT токена для API
 */
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' });
}

/**
 * Middleware для проверки JWT токена
 */
export async function validateJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Отсутствует токен' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
}
