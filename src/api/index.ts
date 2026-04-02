/**
 * API Module — entry point
 */

export {
  createSalesOrder,
  buildSalesOrderPayload,
  validateSalesOrderData,
  formatApiError,
} from './salesOrderApi';

export type {
  SalesOrderRequest,
  SalesOrderResponse,
  SalesOrderSuccessResponse,
  SalesOrderFailedResponse,
} from './types';

export { SalesOrderApiError, isSuccessResponse, isFailedResponse } from './types';

export { API_CONFIG } from './config';
