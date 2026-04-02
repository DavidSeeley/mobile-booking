/**
 * =========================================================================
 * useAsyncOperation Hook
 * =========================================================================
 * A reusable hook for managing async operations with loading states,
 * error handling, and automatic cleanup.
 * 
 * Features:
 * - Automatic loading state management
 * - Error catching and reporting
 * - Cleanup on unmount
 * - Retry functionality
 * 
 * Usage:
 *   const { execute, loading, error, data, reset } = useAsyncOperation();
 * 
 *   const handleSubmit = async () => {
 *     const result = await execute(async () => {
 *       return await apiCall();
 *     });
 *     if (result) {
 *       // Success handling
 *     }
 *   };
 * 
 * v1.12.400
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncOperationState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

interface UseAsyncOperationResult<T> {
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
  retry: () => Promise<T | null>;
}

export function useAsyncOperation<T = unknown>(): UseAsyncOperationResult<T> {
  const [state, setState] = useState<AsyncOperationState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  const isMountedRef = useRef(true);
  const lastOperationRef = useRef<(() => Promise<T>) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    // Store the operation for retry functionality
    lastOperationRef.current = operation;

    // Set loading state
    if (isMountedRef.current) {
      setState({ loading: true, error: null, data: null });
    }

    try {
      const result = await operation();

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setState({ loading: false, error: null, data: result });
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setState({ loading: false, error, data: null });
      }

      // Log error to console (in production, you might send to error tracking)
      console.error('Async operation failed:', error);

      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
    lastOperationRef.current = null;
  }, []);

  const retry = useCallback(async (): Promise<T | null> => {
    if (!lastOperationRef.current) {
      console.warn('No operation to retry');
      return null;
    }
    return execute(lastOperationRef.current);
  }, [execute]);

  return {
    execute,
    loading: state.loading,
    error: state.error,
    data: state.data,
    reset,
    retry,
  };
}
