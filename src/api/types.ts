/**
 * API Type Definitions — Sales Order API v1.00
 */

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

export interface SalesOrderRequest {
  // Account manager (required)
  member_id: number;
  payee_id?: number;               // NetSirv payee ID (profile.trumuv_payee_id)

  // Customer (required)
  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  // Origin address (required)
  start_address: string;
  start_city: string;
  start_state: string;
  start_zipcode: string;

  // Destination address (required)
  end_address: string;
  end_city: string;
  end_state: string;
  end_zipcode: string;

  // Service details (required)
  service_date: string;   // YYYY-MM-DD
  box: number;            // Number of boxes to move
  fur: number;            // Furniture score (sum of room fur values)
  start_rating_id: number; // Rating for origin (stop_type.ratio + disassemble bonus)
  end_rating_id: number;   // Rating for destination (apartment/community type)

  // Optional
  company_name?: string;
  start_secondary_address?: string;
  start_type_id?: number;
  end_secondary_address?: string;  // Property/community name
  end_type_id: number;             // Default: 2 (apartment/community)
  lineup?: number;                 // 1 = morning, 2 = afternoon
  note?: string;                   // Combined: customer memo + contribution allowance
  service_id?: number;
  source_id?: number;
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