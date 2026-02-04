'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { showConfirm, hapticFeedback } from '@/lib/telegram';
import { Gift, Calendar, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.user.getMe().then((res) => res.data),
  });

  const { data: bookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => api.bookings.getMy(false).then((res) => res.data),
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id: number) => api.bookings.cancel(id),
    onSuccess: () => {
      hapticFeedback('heavy');
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });

  const handleCancelBooking = (booking: any) => {
    showConfirm(
      `Отменить запись на ${formatDateTime(booking.startTime)}?`,
      (confirmed) => {
        if (confirmed) {
          cancelBookingMutation.mutate(booking.id);
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { text: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { text: 'Подтверждено', color: 'bg-green-100 text-green-800' },
      COMPLETED: { text: 'Завершено', color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { text: 'Отменено', color: 'bg-red-100 text-red-800' },
    };
    return badges[status as keyof typeof badges] || badges.PENDING;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-6">
        <div className="flex items-center mb-4">
          <Link href="/">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">Мой профиль</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* User Info */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName[0]}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">
                {user?.firstName} {user?.lastName}
              </h2>
              {user?.username && (
                <p className="text-gray-600">@{user.username}</p>
              )}
            </div>
          </div>

          {/* Bonuses */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Gift className="w-8 h-8 text-pink-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Бонусный баланс</p>
                <p className="text-2xl font-bold text-pink-600">
                  {user?.bonusAccount?.balance || 0} ₽
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Всего заработано</p>
              <p className="text-lg font-semibold text-purple-600">
                {user?.bonusAccount?.totalEarned || 0} ₽
              </p>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Мои записи</h3>

          {!bookings || bookings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">У вас пока нет записей</p>
              <Link
                href="/booking"
                className="inline-block bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors"
              >
                Записаться
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking: any) => {
                const badge = getStatusBadge(booking.status);
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {booking.service.name}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDateTime(booking.startTime)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {booking.service.duration} минут
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatPrice(booking.service.price)}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${badge.color}`}
                        >
                          {badge.text}
                        </span>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Комментарий:</span> {booking.notes}
                      </p>
                    )}

                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        disabled={cancelBookingMutation.isPending}
                        className="w-full bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Отменить запись
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bonus Info */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center mb-3">
            <Sparkles className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-semibold">Бонусная программа</h3>
          </div>
          <ul className="space-y-2 text-sm text-pink-100">
            <li>• Получайте 5% бонусов с каждой услуги</li>
            <li>• 50 бонусов за отзыв с фото</li>
            <li>• 1 бонус = 1 рубль</li>
            <li>• Используйте бонусы для оплаты следующих визитов</li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex justify-around">
          <Link href="/" className="text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <span className="text-xs text-gray-600">Главная</span>
          </Link>
          <Link href="/booking" className="text-center">
            <Calendar className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <span className="text-xs text-gray-600">Запись</span>
          </Link>
          <Link href="/profile" className="text-center">
            <Gift className="w-6 h-6 mx-auto mb-1 text-pink-500" />
            <span className="text-xs font-medium text-pink-500">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
