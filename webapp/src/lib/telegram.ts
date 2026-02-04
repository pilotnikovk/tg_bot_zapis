import { init, retrieveLaunchParams } from '@telegram-apps/sdk';

export function initTelegramSDK() {
  if (typeof window === 'undefined') return null;

  try {
    const [webApp] = init();
    return webApp;
  } catch (error) {
    console.error('Ошибка инициализации Telegram SDK:', error);
    return null;
  }
}

export function getTelegramInitData() {
  if (typeof window === 'undefined') return '';

  try {
    const { initDataRaw } = retrieveLaunchParams();
    return initDataRaw || '';
  } catch (error) {
    console.error('Ошибка получения initData:', error);
    return '';
  }
}

export function getTelegramUser() {
  if (typeof window === 'undefined') return null;

  try {
    const { initData } = retrieveLaunchParams();
    return initData?.user || null;
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    return null;
  }
}

export function showBackButton(onClick: () => void) {
  if (typeof window === 'undefined') return;

  try {
    const webApp = initTelegramSDK();
    if (webApp?.backButton) {
      webApp.backButton.show();
      webApp.backButton.onClick(onClick);
    }
  } catch (error) {
    console.error('Ошибка показа кнопки назад:', error);
  }
}

export function hideBackButton() {
  if (typeof window === 'undefined') return;

  try {
    const webApp = initTelegramSDK();
    if (webApp?.backButton) {
      webApp.backButton.hide();
    }
  } catch (error) {
    console.error('Ошибка скрытия кнопки назад:', error);
  }
}

export function showMainButton(text: string, onClick: () => void) {
  if (typeof window === 'undefined') return;

  try {
    const webApp = initTelegramSDK();
    if (webApp?.mainButton) {
      webApp.mainButton.setText(text);
      webApp.mainButton.show();
      webApp.mainButton.onClick(onClick);
    }
  } catch (error) {
    console.error('Ошибка показа главной кнопки:', error);
  }
}

export function hideMainButton() {
  if (typeof window === 'undefined') return;

  try {
    const webApp = initTelegramSDK();
    if (webApp?.mainButton) {
      webApp.mainButton.hide();
    }
  } catch (error) {
    console.error('Ошибка скрытия главной кнопки:', error);
  }
}

export function showAlert(message: string) {
  if (typeof window === 'undefined') return;

  try {
    const webApp = initTelegramSDK();
    if (webApp) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  } catch (error) {
    console.error('Ошибка показа алерта:', error);
    alert(message);
  }
}

export function showConfirm(message: string, callback: (confirmed: boolean) => void) {
  if (typeof window === 'undefined') return;

  try {
    const webApp = initTelegramSDK();
    if (webApp) {
      webApp.showConfirm(message, callback);
    } else {
      callback(confirm(message));
    }
  } catch (error) {
    console.error('Ошибка показа подтверждения:', error);
    callback(confirm(message));
  }
}

export function closeTelegramApp() {
  if (typeof window === 'undefined') return;

  try {
    const webApp = initTelegramSDK();
    if (webApp) {
      webApp.close();
    }
  } catch (error) {
    console.error('Ошибка закрытия приложения:', error);
  }
}

export function expandTelegramApp() {
  if (typeof window === 'undefined') return;

  try {
    const webApp = initTelegramSDK();
    if (webApp) {
      webApp.expand();
    }
  } catch (error) {
    console.error('Ошибка расширения приложения:', error);
  }
}

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') {
  if (typeof window === 'undefined') return;

  try {
    const webApp = initTelegramSDK();
    if (webApp?.hapticFeedback) {
      webApp.hapticFeedback.impactOccurred(type);
    }
  } catch (error) {
    console.error('Ошибка тактильного отклика:', error);
  }
}
