'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice, formatTime } from '@/lib/utils';
import { showAlert, hapticFeedback, showMainButton, hideMainButton } from '@/lib/telegram';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.services.getCategories().then((res) => res.data),
  });

  const { data: availableSlots, isLoading: loadingSlots } = useQuery({
    queryKey: ['availableSlots', selectedDate, selectedService?.id],
    queryFn: () =>
      api.bookings
        .getAvailableSlots(
          selectedDate.toISOString(),
          selectedService.id
        )
        .then((res) => res.data.slots),
    enabled: !!selectedService,
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: any) => api.bookings.create(data),
    onSuccess: () => {
      hapticFeedback('heavy');
      showAlert('Запись успешно создана! Мы отправим вам напоминание.');
      router.push('/profile');
    },
    onError: () => {
      hapticFeedback('heavy');
      showAlert('Ошибка при создании записи. Попробуйте еще раз.');
    },
  });

  const handleCreateBooking = () => {
    if (!selectedService || !selectedTime) {
      showAlert('Выберите услугу и время');
      return;
    }

    createBookingMutation.mutate({
      serviceId: selectedService.id,
      startTime: selectedTime,
      notes: notes || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-6">
        <div className="flex items-center mb-4">
          <Link href="/">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">Запись на услугу</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Step 1: Select Service */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Выберите услугу</h2>
          {categories?.map((category: any) => (
            <div key={category.id} className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-700">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.services?.map((service: any) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setSelectedTime(null);
                      hapticFeedback('light');
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedService?.id === service.id
                        ? 'bg-pink-500 text-white shadow-lg'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className={`text-sm ${
                          selectedService?.id === service.id
                            ? 'text-pink-100'
                            : 'text-gray-600'
                        }`}>
                          {service.duration} мин
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatPrice(service.price)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Step 2: Select Date & Time */}
        {selectedService && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Выберите дату и время</h2>

            {/* Date selector */}
            <div className="mb-4">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(new Date(e.target.value));
                  setSelectedTime(null);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Time slots */}
            {loadingSlots && (
              <div className="text-center py-8 text-gray-500">
                Загрузка доступных слотов...
              </div>
            )}

            {availableSlots && availableSlots.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-white rounded-xl">
                На выбранную дату нет свободных слотов
              </div>
            )}

            {availableSlots && availableSlots.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot: string) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedTime(slot);
                      hapticFeedback('light');
                    }}
                    className={`p-3 rounded-xl font-medium transition-all ${
                      selectedTime === slot
                        ? 'bg-pink-500 text-white shadow-lg'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Notes */}
        {selectedTime && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Комментарий (необязательно)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Например: хочу френч или омбре..."
              className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Submit Button */}
        {selectedTime && (
          <button
            onClick={handleCreateBooking}
            disabled={createBookingMutation.isPending}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
          >
            {createBookingMutation.isPending ? 'Создание записи...' : 'Подтвердить запись'}
          </button>
        )}
      </div>
    </div>
  );
}
