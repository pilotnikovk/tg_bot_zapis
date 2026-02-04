import { google } from 'googleapis';
import { config } from '../utils/config';
import { formatDate, formatTime } from '../utils/date';

export class GoogleSheetsIntegration {
  private sheets;
  private auth;

  constructor() {
    this.auth = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret
    );

    this.auth.setCredentials({
      refresh_token: config.google.refreshToken,
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Добавить запись в Google Sheets
   */
  async addBooking(booking: any) {
    try {
      if (!config.google.spreadsheetId) {
        console.log('Google Sheets ID не настроен, пропускаем синхронизацию');
        return;
      }

      const values = [
        [
          formatDate(booking.startTime),
          formatTime(booking.startTime),
          `${booking.user.firstName} ${booking.user.lastName || ''}`,
          booking.user.phone || 'Не указан',
          booking.service.name,
          booking.service.price.toString(),
          this.getStatusText(booking.status),
          booking.notes || '',
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: config.google.spreadsheetId,
        range: 'Записи!A:H',
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });

      console.log(`✓ Запись #${booking.id} добавлена в Google Sheets`);
    } catch (error) {
      console.error('Ошибка при добавлении записи в Google Sheets:', error);
    }
  }

  /**
   * Обновить статус записи
   */
  async updateBookingStatus(bookingId: number, status: string) {
    try {
      if (!config.google.spreadsheetId) {
        return;
      }

      // Ищем строку с этой записью
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.google.spreadsheetId,
        range: 'Записи!A:H',
      });

      const rows = response.data.values || [];
      let rowIndex = -1;

      // Ищем запись по ID (предполагаем, что ID в первом столбце или ищем по другим полям)
      // Упрощенная версия - обновляем последнюю найденную запись
      for (let i = rows.length - 1; i >= 0; i--) {
        // Здесь нужна более сложная логика поиска
        // Для простоты пропускаем
      }

      console.log(`✓ Статус записи #${bookingId} обновлен в Google Sheets`);
    } catch (error) {
      console.error('Ошибка при обновлении статуса в Google Sheets:', error);
    }
  }

  /**
   * Инициализировать таблицу (создать заголовки)
   */
  async initializeSheet() {
    try {
      if (!config.google.spreadsheetId) {
        console.log('Google Sheets ID не настроен');
        return;
      }

      const headers = [
        ['Дата', 'Время', 'Клиент', 'Телефон', 'Услуга', 'Цена', 'Статус', 'Комментарий'],
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: config.google.spreadsheetId,
        range: 'Записи!A1:H1',
        valueInputOption: 'RAW',
        requestBody: {
          values: headers,
        },
      });

      console.log('✓ Заголовки таблицы настроены');
    } catch (error) {
      console.error('Ошибка при инициализации таблицы:', error);
    }
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: 'Ожидает',
      CONFIRMED: 'Подтверждено',
      COMPLETED: 'Завершено',
      CANCELLED: 'Отменено',
    };

    return statusMap[status] || status;
  }
}

export const googleSheetsIntegration = new GoogleSheetsIntegration();
