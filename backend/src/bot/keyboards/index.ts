import { InlineKeyboard } from 'grammy';
import { config } from '../../utils/config';

export function getMainKeyboard() {
  return new InlineKeyboard()
    .webApp('📅 Записаться', `${config.webappUrl}/booking`)
    .row()
    .webApp('📋 Мои записи', `${config.webappUrl}/profile`)
    .row()
    .webApp('💅 Галерея работ', config.webappUrl);
}

export function getAdminKeyboard() {
  return new InlineKeyboard()
    .webApp('⚙️ Админ-панель', `${config.webappUrl}/admin`)
    .row()
    .text('📊 Статистика', 'admin_stats')
    .row()
    .text('📝 Записи на сегодня', 'admin_today');
}

export function getBookingActionsKeyboard(bookingId: number) {
  return new InlineKeyboard()
    .text('✅ Подтвердить', `confirm_booking_${bookingId}`)
    .text('❌ Отменить', `cancel_booking_${bookingId}`)
    .row()
    .text('📝 Перенести', `reschedule_booking_${bookingId}`);
}

export function getConfirmationKeyboard(action: string, id: number) {
  return new InlineKeyboard()
    .text('✅ Да', `confirm_${action}_${id}`)
    .text('❌ Нет', `cancel_${action}_${id}`);
}

export function getReviewKeyboard(bookingId: number) {
  return new InlineKeyboard()
    .webApp('⭐ Оставить отзыв', `${config.webappUrl}/review/${bookingId}`)
    .row()
    .text('❌ Закрыть', 'close_message');
}
