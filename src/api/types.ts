/**
 * API Type Definitions — Sales Order API v1.00
 */

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

export interface SalesOrderRequest {
  // Customer
  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  // Origin address (where they currently live)
  start_address: string;
  start_city: string;
  start_state: string;
  start_zipcode: string;

  // Destination address (where they're moving to)
  end_address: string;
  end_secondary_address: string; // Property/community name
  end_city: string;
  end_state: string;
  end_zipcode: string;

  // Service details
  service_date: string;   // YYYY-MM-DD
  box: string;            // Number of rooms selected (as string)
  fur: string;            // Bedroom count (as string)
  rating_id: number;      // Default: 1

  // Optional
  company_name?: string;
  start_secondary_address?: string;
  service_id?: number;
  source_id?: number;
  source?: string;
  payee_id?: number;
}

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export interface SalesOrderSuccessResponse {
  status: 'OK';
  lead_id: number;
  order_id: number;
}

export interface SalesOrderFailedResponse {
  status: 'Fail';
  data: string;
  Level: number;
  Params?: Record<string, string | number>;
}

export type SalesOrderResponse = SalesOrderSuccessResponse | SalesOrderFailedResponse;

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class SalesOrderApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: SalesOrderFailedResponse,
    /** Raw HTTP response body text (before JSON parse) */
    public rawBody?: string,
    /** form-url-encoded string that was POSTed */
    public sentPayload?: string,
    /** Full request URL that was called */
    public requestUrl?: string,
  ) {
    super(message);
    this.name = 'SalesOrderApiError';
  }
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

export function isSuccessResponse(
  response: SalesOrderResponse
): response is SalesOrderSuccessResponse {
  return response.status === 'OK';
}

export function isFailedResponse(
  response: SalesOrderResponse
): response is SalesOrderFailedResponse {
  return response.status === 'Fail';
}