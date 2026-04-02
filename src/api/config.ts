/**
 * API Configuration
 * Central configuration for API endpoints and settings.
 * Keys and base URL are read from environment variables via env.ts.
 */

import { API_BASE_URL } from '@/utils/env';

export const API_CONFIG = {
  // API_BASE_URL already contains the full endpoint (e.g. ?controller=sales_order).
  // Use it directly as the POST target — do not append any path segments.
  baseUrl: API_BASE_URL,
  timeout: 30000, // 30 seconds
} as const;

export const API_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
} as const;