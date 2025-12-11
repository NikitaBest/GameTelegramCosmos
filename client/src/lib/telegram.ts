/**
 * Telegram Web App utilities
 * Provides integration with Telegram Mini App API
 */

// Type definitions for Telegram Web App
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
          chat?: {
            id: number;
            type: string;
            title?: string;
          };
          auth_date: number;
          hash: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        CloudStorage: {
          setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void;
          getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
          getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void;
          removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void;
          removeItems: (keys: string[], callback?: (error: Error | null, success: boolean) => void) => void;
          getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (id: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: {
          text?: string;
        }, callback?: (data: string) => void) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (text: string) => void) => void;
        requestWriteAccess: (callback?: (granted: boolean) => void) => void;
        requestContact: (callback?: (granted: boolean) => void) => void;
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        enableVerticalSwiping: () => void;
        disableVerticalSwiping: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}

/**
 * Check if the app is running in Telegram
 */
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined;
}

/**
 * Get Telegram Web App instance
 */
export function getTelegramWebApp() {
  if (!isTelegramWebApp()) {
    return null;
  }
  return window.Telegram!.WebApp;
}

/**
 * Initialize Telegram Web App
 */
export function initTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (!tg) {
    return;
  }

  // Expand the app to full height
  tg.expand();

  // Enable closing confirmation (optional)
  // tg.enableClosingConfirmation();

  // Set theme colors if needed
  // tg.setHeaderColor('#000000');
  // tg.setBackgroundColor('#000000');

  // Ready signal
  tg.ready();

  return tg;
}

/**
 * Get Telegram user data
 */
export function getTelegramUser() {
  const tg = getTelegramWebApp();
  if (!tg) {
    return null;
  }
  return tg.initDataUnsafe.user || null;
}

/**
 * Haptic feedback helpers
 */
export const haptic = {
  light: () => {
    const tg = getTelegramWebApp();
    tg?.HapticFeedback.impactOccurred('light');
  },
  medium: () => {
    const tg = getTelegramWebApp();
    tg?.HapticFeedback.impactOccurred('medium');
  },
  heavy: () => {
    const tg = getTelegramWebApp();
    tg?.HapticFeedback.impactOccurred('heavy');
  },
  success: () => {
    const tg = getTelegramWebApp();
    tg?.HapticFeedback.notificationOccurred('success');
  },
  error: () => {
    const tg = getTelegramWebApp();
    tg?.HapticFeedback.notificationOccurred('error');
  },
  warning: () => {
    const tg = getTelegramWebApp();
    tg?.HapticFeedback.notificationOccurred('warning');
  },
};

/**
 * Get viewport height for safe area calculations
 */
export function getViewportHeight(): number {
  const tg = getTelegramWebApp();
  if (tg) {
    return tg.viewportHeight;
  }
  return window.innerHeight;
}

/**
 * Get stable viewport height (without keyboard)
 */
export function getStableViewportHeight(): number {
  const tg = getTelegramWebApp();
  if (tg) {
    return tg.viewportStableHeight;
  }
  return window.innerHeight;
}

