'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Sparkles, Calendar, Gift, Star } from 'lucide-react';

export default function HomePage() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.services.getCategories().then((res) => res.data),
  });

  const { data: gallery } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => api.gallery.getAll().then((res) => res.data),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Красота в один клик! 💅
          </h1>
          <p className="text-xl mb-8 text-pink-100">
            Профессиональный маникюр и педикюр с бонусной системой
          </p>
          <Link
            href="/booking"
            className="inline-block bg-white text-pink-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Записаться сейчас
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <Calendar className="w-8 h-8 text-pink-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Удобная запись</h3>
            <p className="text-sm text-gray-600">
              Выберите удобное время онлайн
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <Gift className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Бонусы 5%</h3>
            <p className="text-sm text-gray-600">
              Кэшбек с каждого посещения
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <Sparkles className="w-8 h-8 text-pink-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Качество</h3>
            <p className="text-sm text-gray-600">
              Опыт работы более 5 лет
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Отзывы</h3>
            <p className="text-sm text-gray-600">
              Довольные клиенты
            </p>
          </div>
        </div>

        {/* Gallery */}
        {gallery && gallery.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Наши работы
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {gallery.slice(0, 6).map((item: any) => (
                <div
                  key={item.id}
                  className="aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-sm"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Наши услуги
          </h2>
          {categories?.map((category: any) => (
            <div key={category.id} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                {category.name}
              </h3>
              <div className="space-y-3">
                {category.services?.map((service: any) => (
                  <div
                    key={service.id}
                    className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-sm text-gray-600">
                        {service.duration} мин
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-pink-600">
                        {formatPrice(service.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-8 rounded-2xl text-center">
          <h3 className="text-2xl font-bold mb-4">
            Готовы к преображению?
          </h3>
          <p className="mb-6 text-pink-100">
            Запишитесь прямо сейчас и получите 5% бонусов!
          </p>
          <Link
            href="/booking"
            className="inline-block bg-white text-pink-600 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Выбрать время
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex justify-around">
          <Link href="/" className="text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-1 text-pink-500" />
            <span className="text-xs font-medium text-pink-500">Главная</span>
          </Link>
          <Link href="/booking" className="text-center">
            <Calendar className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <span className="text-xs text-gray-600">Запись</span>
          </Link>
          <Link href="/profile" className="text-center">
            <Gift className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <span className="text-xs text-gray-600">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
