import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  adminTelegramId: process.env.ADMIN_TELEGRAM_ID || '',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Server
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // WebApp
  webappUrl: process.env.WEBAPP_URL || 'http://localhost:3000',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',

  // Google APIs
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '',
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  },
};

export function validateConfig() {
  const required = [
    'telegramBotToken',
    'databaseUrl',
    'jwtSecret',
  ];

  const missing = required.filter((key) => !config[key as keyof typeof config]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
