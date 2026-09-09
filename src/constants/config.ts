export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:3001/v1';

export const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

export const IS_DEV = APP_ENV === 'development';

export const REQUEST_TIMEOUT_MS = 30000;
