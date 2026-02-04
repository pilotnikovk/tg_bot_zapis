import axios from 'axios';
import { getTelegramInitData } from './telegram';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем Telegram initData к каждому запросу
apiClient.interceptors.request.use((config) => {
  const initData = getTelegramInitData();
  if (initData) {
    config.headers['x-telegram-init-data'] = initData;
  }
  return config;
});

// API функции

export const api = {
  // Услуги
  services: {
    getCategories: () => apiClient.get('/api/services/categories'),
    getAll: () => apiClient.get('/api/services'),
    getById: (id: number) => apiClient.get(`/api/services/${id}`),
  },

  // Записи
  bookings: {
    getAvailableSlots: (date: string, serviceId: number) =>
      apiClient.get('/api/bookings/available-slots', {
        params: { date, serviceId },
      }),
    create: (data: { serviceId: number; startTime: string; notes?: string }) =>
      apiClient.post('/api/bookings', data),
    getMy: (includeCompleted?: boolean) =>
      apiClient.get('/api/bookings/my', {
        params: { includeCompleted },
      }),
    getById: (id: number) => apiClient.get(`/api/bookings/${id}`),
    cancel: (id: number) => apiClient.post(`/api/bookings/${id}/cancel`),
  },

  // Пользователь
  user: {
    getMe: () => apiClient.get('/api/user/me'),
  },

  // Галерея
  gallery: {
    getAll: () => apiClient.get('/api/gallery'),
  },

  // Отзывы
  reviews: {
    getAll: () => apiClient.get('/api/reviews'),
    create: (data: {
      bookingId: number;
      rating: number;
      comment?: string;
      photos?: string[];
    }) => apiClient.post('/api/reviews', data),
  },

  // Бонусы
  bonuses: {
    getHistory: () => apiClient.get('/api/bonuses/history'),
  },

  // Админ
  admin: {
    services: {
      create: (data: any) => apiClient.post('/api/admin/services', data),
      update: (id: number, data: any) => apiClient.put(`/api/admin/services/${id}`, data),
      delete: (id: number) => apiClient.delete(`/api/admin/services/${id}`),
    },
    bookings: {
      getAll: (params?: { status?: string; date?: string }) =>
        apiClient.get('/api/admin/bookings', { params }),
    },
    stats: {
      get: () => apiClient.get('/api/admin/stats'),
    },
  },
};

export default apiClient;
