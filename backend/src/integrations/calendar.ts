import { google } from 'googleapis';
import { config } from '../utils/config';
import { formatDateTime } from '../utils/date';

export class GoogleCalendarIntegration {
  private calendar;
  private auth;

  constructor() {
    this.auth = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret
    );

    this.auth.setCredentials({
      refresh_token: config.google.refreshToken,
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  /**
   * Создать событие в календаре
   */
  async createEvent(booking: any): Promise<string | null> {
    try {
      if (!config.google.calendarId) {
        console.log('Google Calendar ID не настроен, пропускаем создание события');
        return null;
      }

      const event = {
        summary: `${booking.service.name} - ${booking.user.firstName}`,
        description: [
          `Клиент: ${booking.user.firstName} ${booking.user.lastName || ''}`,
          booking.user.phone ? `Телефон: ${booking.user.phone}` : '',
          booking.notes ? `\nКомментарий: ${booking.notes}` : '',
          `\nСтоимость: ${booking.service.price} ₽`,
        ]
          .filter(Boolean)
          .join('\n'),
        start: {
          dateTime: booking.startTime.toISOString(),
          timeZone: 'Europe/Moscow',
        },
        end: {
          dateTime: booking.endTime.toISOString(),
          timeZone: 'Europe/Moscow',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 120 }, // За 2 часа
            { method: 'popup', minutes: 1440 }, // За 24 часа
          ],
        },
        colorId: '9', // Синий цвет для записей
      };

      const response = await this.calendar.events.insert({
        calendarId: config.google.calendarId,
        requestBody: event,
      });

      console.log(`✓ Событие создано в Google Calendar: ${response.data.id}`);
      return response.data.id || null;
    } catch (error) {
      console.error('Ошибка при создании события в Google Calendar:', error);
      return null;
    }
  }

  /**
   * Обновить событие в календаре
   */
  async updateEvent(eventId: string, booking: any) {
    try {
      if (!config.google.calendarId) {
        return;
      }

      const event = {
        summary: `${booking.service.name} - ${booking.user.firstName}`,
        description: [
          `Клиент: ${booking.user.firstName} ${booking.user.lastName || ''}`,
          booking.user.phone ? `Телефон: ${booking.user.phone}` : '',
          booking.notes ? `\nКомментарий: ${booking.notes}` : '',
          `\nСтоимость: ${booking.service.price} ₽`,
          `\nСтатус: ${this.getStatusText(booking.status)}`,
        ]
          .filter(Boolean)
          .join('\n'),
        start: {
          dateTime: booking.startTime.toISOString(),
          timeZone: 'Europe/Moscow',
        },
        end: {
          dateTime: booking.endTime.toISOString(),
          timeZone: 'Europe/Moscow',
        },
        colorId: this.getColorByStatus(booking.status),
      };

      await this.calendar.events.update({
        calendarId: config.google.calendarId,
        eventId: eventId,
        requestBody: event,
      });

      console.log(`✓ Событие обновлено в Google Calendar: ${eventId}`);
    } catch (error) {
      console.error('Ошибка при обновлении события в Google Calendar:', error);
    }
  }

  /**
   * Удалить событие из календаря
   */
  async deleteEvent(eventId: string) {
    try {
      if (!config.google.calendarId) {
        return;
      }

      await this.calendar.events.delete({
        calendarId: config.google.calendarId,
        eventId: eventId,
      });

      console.log(`✓ Событие удалено из Google Calendar: ${eventId}`);
    } catch (error) {
      console.error('Ошибка при удалении события из Google Calendar:', error);
    }
  }

  /**
   * Получить свободные слоты из календаря
   */
  async getFreeBusy(startDate: Date, endDate: Date) {
    try {
      if (!config.google.calendarId) {
        return [];
      }

      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: config.google.calendarId }],
        },
      });

      const busy = response.data.calendars?.[config.google.calendarId]?.busy || [];
      return busy;
    } catch (error) {
      console.error('Ошибка при получении занятых слотов:', error);
      return [];
    }
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: 'Ожидает подтверждения',
      CONFIRMED: 'Подтверждено',
      COMPLETED: 'Завершено',
      CANCELLED: 'Отменено',
    };

    return statusMap[status] || status;
  }

  private getColorByStatus(status: string): string {
    const colorMap: Record<string, string> = {
      PENDING: '5', // Желтый - ожидание
      CONFIRMED: '9', // Синий - подтверждено
      COMPLETED: '10', // Зеленый - завершено
      CANCELLED: '11', // Красный - отменено
    };

    return colorMap[status] || '9';
  }
}

export const googleCalendarIntegration = new GoogleCalendarIntegration();
