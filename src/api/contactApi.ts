/**
 * Contact Enrollment API — ApiContact v1.00
 * POST ?controller=contact&action=request
 */

import { API_CONFIG, API_HEADERS } from './config';
import { SalesOrderApiError } from './types';

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

export interface ContactRequest {
  first_name?:        string;
  last_name?:         string;
  company_name?:      string;
  email:              string; // required
  main_phone?:        string;
  address?:           string;
  secondary_address?: string;
  city?:              string;
  state?:             string;
  zip?:               string;
  // Role flags (1 or 0)
  member?:    0 | 1;
  customer?:  0 | 1;
  payee?:     0 | 1;
  vendor?:    0 | 1;
  sponsor?:   0 | 1;
  affiliate?:  0 | 1;
  // Contribution
  allowance?: number;
}

// ---------------------------------------------------------------------------
// Response
// ---------------------------------------------------------------------------

export interface ContactSuccessResponse {
  status: 'OK';
  [key: string]: unknown;
}

export interface ContactFailedResponse {
  status: 'Fail';
  data:   string;
  Level?: number;
  Params?: Record<string, string | number>;
}

export type ContactResponse = ContactSuccessResponse | ContactFailedResponse;

// ---------------------------------------------------------------------------
// Encoding helper
// ---------------------------------------------------------------------------

function toFormUrlEncoded(data: Record<string, string | number | undefined>): string {
  return Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

const CONTACT_URL = API_CONFIG.baseUrl.replace(
  /controller=[^&]*/,
  'controller=contact&action=request'
);

export async function createContact(
  data: ContactRequest
): Promise<ContactSuccessResponse> {
  const encodedBody = toFormUrlEncoded(data as unknown as Record<string, string | number>);

  let response: Response;
  try {
    response = await fetch(CONTACT_URL, {
      method:  'POST',
      headers: API_HEADERS,
      body:    encodedBody,
      signal:  AbortSignal.timeout(API_CONFIG.timeout),
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        throw new SalesOrderApiError('Request timed out — please try again.', 408, undefined, undefined, encodedBody, CONTACT_URL);
      }
      throw new SalesOrderApiError(`Network error: ${err.message}`, 0, undefined, undefined, encodedBody, CONTACT_URL);
    }
    throw new SalesOrderApiError('Unknown network error.', 0, undefined, undefined, encodedBody, CONTACT_URL);
  }

  let rawBody: string;
  try { rawBody = await response.text(); } catch { rawBody = '(could not read response body)'; }

  let parsed: ContactResponse;
  try {
    parsed = JSON.parse(rawBody) as ContactResponse;
  } catch {
    throw new SalesOrderApiError(
      `Non-JSON response (HTTP ${response.status})`,
      response.status, undefined, rawBody, encodedBody, CONTACT_URL,
    );
  }

  if (response.status === 200 && parsed.status === 'OK') {
    return parsed as ContactSuccessResponse;
  }

  const failed = parsed.status === 'Fail' ? parsed : undefined;
  throw new SalesOrderApiError(
    failed?.data ?? `Enrollment failed (HTTP ${response.status})`,
    response.status, failed as never, rawBody, encodedBody, CONTACT_URL,
  );
}
