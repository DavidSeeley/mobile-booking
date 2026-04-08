export type CardKey = 'contact' | 'address';
export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface SubmitDebugInfo {
  timestamp: string;
  requestUrl?: string;
  httpStatus: number;
  errorMessage: string;
  errorName?: string;
  errorStack?: string;
  apiStatus?: string;
  apiMessage?: string;
  apiLevel?: number;
  apiParams?: Record<string, string | number>;
  rawBody?: string;
  sentPayload?: string;
}
