/**
 * Sales Order API Client — ApiSalesOrder v1.00
 */

import { API_CONFIG, API_HEADERS } from './config';
import type {
  SalesOrderRequest,
  SalesOrderResponse,
  SalesOrderSuccessResponse,
} from './types';
import { SalesOrderApiError, isSuccessResponse } from './types';
import type { SavedContact, SavedAddress, SavedWelcome, SavedInventory } from '@/mocks/MobileCust';
import { loadAdminVars } from '@/mocks/AdminVar';

// ---------------------------------------------------------------------------
// Payload builder
// ---------------------------------------------------------------------------

/**
 * Builds the complete SalesOrderRequest payload from the data collected
 * across the multi-step form flow.
 *
 * - contact  : name, phone, service date   (Contact page)
 * - address  : current/origin address      (Address page)
 * - welcome  : destination + unit type     (Welcome page)
 * - inventory: selected rooms              (Inventory page)
 * - email    : entered on Confirmation page
 */
export function buildSalesOrderPayload(params: {
  contact:   SavedContact;
  address:   SavedAddress;
  welcome:   SavedWelcome;
  inventory: SavedInventory;
  email:     string;
}): SalesOrderRequest {
  const { contact, address, welcome, inventory, email } = params;

  // Furniture total: sum the fur value for each selected room from AdminVar roomSizes.
  // For 'bedroom', multiply by bedroomCount (user may be moving multiple bedrooms).
  const adminVars = loadAdminVars();
  const furTotal = inventory.selectedRooms.reduce((sum, roomId) => {
    const roomRow = adminVars.roomSizes.find((r) => r.id === roomId);
    if (!roomRow) return sum;
    const multiplier = roomId === 'bedroom' ? inventory.bedroomCount : 1;
    return sum + roomRow.fur * multiplier;
  }, 0);

  return {
    // Customer
    first_name: contact.firstName,
    last_name:  contact.lastName,
    email:      email.trim(),
    phone:      contact.cellPhone,

    // Origin — individual fields stored directly on SavedAddress
    start_address:  address.street,
    start_city:     address.city,
    start_state:    address.state,
    start_zipcode:  address.zipcode,

    // Destination
    end_address:           welcome.locationStreet,
    end_secondary_address: welcome.locationLabel,
    end_city:              welcome.locationCity,
    end_state:             welcome.locationState,
    end_zipcode:           welcome.locationZip,

    // Service
    service_date: contact.serviceDate,
    box:          String(inventory.selectedRooms.length),
    fur:          String(furTotal),
    rating_id:    1,

    // Tracking
    source: 'online',
  };
}

// ---------------------------------------------------------------------------
// Encoding helper
// ---------------------------------------------------------------------------

function toFormUrlEncoded(data: Record<string, string | number | undefined>): string {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

/**
 * Submits a sales order to the API.
 * Resolves with lead_id and order_id on success.
 * Throws SalesOrderApiError on failure.
 */
export async function createSalesOrder(
  orderData: SalesOrderRequest
): Promise<SalesOrderSuccessResponse> {
  // The base URL already contains the full endpoint (e.g. ?controller=sales_order).
  // Do NOT append any path segment — that would corrupt the query string.
  const url = API_CONFIG.baseUrl;

  // Encode once so we can attach the exact bytes sent to any thrown error
  const encodedBody = toFormUrlEncoded(orderData as Record<string, string | number>);

  let response: Response;

  try {
    response = await fetch(url, {
      method:  'POST',
      headers: API_HEADERS,
      body:    encodedBody,
      signal:  AbortSignal.timeout(API_CONFIG.timeout),
    });
  } catch (err) {
    if (err instanceof SalesOrderApiError) throw err;
    if (err instanceof Error) {
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        throw new SalesOrderApiError('Request timed out — please try again.', 408, undefined, undefined, encodedBody, url);
      }
      throw new SalesOrderApiError(`Network error: ${err.message}`, 0, undefined, undefined, encodedBody, url);
    }
    throw new SalesOrderApiError('Unknown network error.', 0, undefined, undefined, encodedBody, url);
  }

  // Read raw text first so we always have the full body for debugging,
  // even when JSON parsing fails.
  let rawBody: string;
  try {
    rawBody = await response.text();
  } catch {
    rawBody = '(could not read response body)';
  }

  let data: SalesOrderResponse;
  try {
    data = JSON.parse(rawBody) as SalesOrderResponse;
  } catch {
    throw new SalesOrderApiError(
      `Non-JSON response (HTTP ${response.status}) — check Raw Response in debug panel.`,
      response.status,
      undefined,
      rawBody,
      encodedBody,
      url,
    );
  }

  if (response.status === 200 && isSuccessResponse(data)) {
    return data;
  }

  const failedData = isSuccessResponse(data) ? undefined : data;

  if (response.status === 400) {
    throw new SalesOrderApiError(
      'Incorrect data provided — please review your details and try again.',
      400,
      failedData,
      rawBody,
      encodedBody,
      url,
    );
  }

  if (response.status === 500) {
    throw new SalesOrderApiError(
      'Server error — please try again in a moment.',
      500,
      failedData,
      rawBody,
      encodedBody,
      url,
    );
  }

  // 200 but status !== 'OK'
  if (!isSuccessResponse(data)) {
    throw new SalesOrderApiError(
      data.data || 'Order submission failed.',
      response.status,
      data,
      rawBody,
      encodedBody,
      url,
    );
  }

  throw new SalesOrderApiError(
    `Unexpected status: ${response.status}`,
    response.status,
    undefined,
    rawBody,
    encodedBody,
    url,
  );
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Returns an array of missing required field names.
 * Call before createSalesOrder to surface problems early.
 */
export function validateSalesOrderData(
  orderData: Partial<SalesOrderRequest>
): string[] {
  const required: (keyof SalesOrderRequest)[] = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'start_address',
    'start_city',
    'start_state',
    'start_zipcode',
    'end_address',
    'end_secondary_address',
    'end_city',
    'end_state',
    'end_zipcode',
    'service_date',
    'box',
    'fur',
    'rating_id',
  ];

  return required.filter((field) => !orderData[field]);
}

// ---------------------------------------------------------------------------
// Error formatting
// ---------------------------------------------------------------------------

export function formatApiError(error: unknown): string {
  if (error instanceof SalesOrderApiError) {
    if (error.response) {
      const params = error.response.Params
        ? `\nParameters: ${JSON.stringify(error.response.Params, null, 2)}`
        : '';
      return `${error.response.data}${params}`;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unknown error occurred.';
}