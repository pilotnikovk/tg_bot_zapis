import { format, addMinutes, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatDate(date: Date, formatStr: string = 'dd.MM.yyyy'): string {
  return format(date, formatStr, { locale: ru });
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm', { locale: ru });
}

export function formatDateTime(date: Date): string {
  return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
}

export function addDuration(date: Date, minutes: number): Date {
  return addMinutes(date, minutes);
}

export function isTimeSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  existingBookings: Array<{ startTime: Date; endTime: Date }>
): boolean {
  return !existingBookings.some((booking) =>
    isWithinInterval(slotStart, { start: booking.startTime, end: booking.endTime }) ||
    isWithinInterval(slotEnd, { start: booking.startTime, end: booking.endTime }) ||
    (slotStart <= booking.startTime && slotEnd >= booking.endTime)
  );
}

export function getDayStart(date: Date): Date {
  return startOfDay(date);
}

export function getDayEnd(date: Date): Date {
  return endOfDay(date);
}

export function getWeekdayName(date: Date): string {
  return format(date, 'EEEE', { locale: ru });
}
