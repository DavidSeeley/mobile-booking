/**
 * API Configuration
 * Central configuration for API endpoints and settings.
 * Keys and base URL are read from environment variables via env.ts.
 */

import { API_BASE_URL, API_KEY } from '@/utils/env';

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: 30000, // 30 seconds
} as const;

export const API_HEADERS = {
  'Content-Type':  'application/x-www-form-urlencoded',
  'authorization': `Bearer ${API_KEY}`,
} as const;