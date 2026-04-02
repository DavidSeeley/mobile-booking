/**
 * =========================================================================
 * APPLICATION CONFIGURATION
 * =========================================================================
 *
 * MOCK_MODE controls the entire application behavior:
 * - true:  Mock data mode (localStorage persistence, no API calls)
 * - false: Production mode (API integration with ApiSalesOrder v1.00)
 *
 * ⚠️  Keys and endpoints are read from environment variables via env.ts.
 *     Never hardcode credentials in this file.
 */

import { API_BASE_URL } from './env';

// CORE CONFIGURATION
export const MOCK_MODE = true; // Set to false when ready to connect to the API

// API CONFIGURATION
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: {
    salesOrder: '/sales_order',
  },
  timeout: 30000, // 30 seconds
} as const;

export const FEATURES = {
  enableDebugMode: import.meta.env.DEV,
  enableAnalytics: false,
  enablePerformanceMonitoring: false,
} as const;

export const STORAGE_CONFIG = {
  prefix: 'localmotion_',     // Prefix for all localStorage keys
  version: '1.0.0',  // Version for cache invalidation
} as const;

export const PAGINATION = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
} as const;

export const DATE_FORMATS = {
  display:   'MM/DD/YYYY',          // Display format for users
  storage:   'YYYY-MM-DD',          // Storage format for database
  timestamp: 'YYYY-MM-DDTHH:mm:ssZ', // ISO 8601 timestamp
} as const;

// ENVIRONMENT HELPERS
export const isDevelopment = import.meta.env.DEV;
export const isProduction  = import.meta.env.PROD;
export const isTest        = import.meta.env.MODE === 'test';

// TYPE EXPORTS
export type AppConfig = {
  mockMode:    typeof MOCK_MODE;
  api:         typeof API_CONFIG;
  features:    typeof FEATURES;
  storage:     typeof STORAGE_CONFIG;
  pagination:  typeof PAGINATION;
  dateFormats: typeof DATE_FORMATS;
};

export const APP_CONFIG: AppConfig = {
  mockMode:    MOCK_MODE,
  api:         API_CONFIG,
  features:    FEATURES,
  storage:     STORAGE_CONFIG,
  pagination:  PAGINATION,
  dateFormats: DATE_FORMATS,
} as const;

// CONSOLE LOGGING
if (typeof window !== 'undefined' && MOCK_MODE) {
  console.log(
    '%c⚙️  APPLICATION CONFIG',
    'background: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  );
  console.log(
    '%cMOCK_MODE: ENABLED',
    'background: #3B82F6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;'
  );
  console.log('%c  Using mock data with localStorage persistence', 'color: #3B82F6;');
  console.log('%c  To switch to API mode, set MOCK_MODE = false in /src/app/utils/config.ts', 'color: #64748B;');
} else if (typeof window !== 'undefined' && !MOCK_MODE) {
  console.log(
    '%c⚙️  APPLICATION CONFIG',
    'background: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  );
  console.log(
    '%cMOCK_MODE: DISABLED',
    'background: #EF4444; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;'
  );
  console.log('%c  Using ApiSalesOrder v1.00 API', 'color: #EF4444;');
  console.log(`%c  API Endpoint: ${API_CONFIG.baseUrl}${API_CONFIG.endpoints.salesOrder}`, 'color: #64748B;');
}