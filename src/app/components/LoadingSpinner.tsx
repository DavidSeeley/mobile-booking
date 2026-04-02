/**
 * =========================================================================
 * LoadingSpinner Component
 * =========================================================================
 * A reusable loading spinner with configurable size and message.
 * 
 * Part of Step 5 optimization (Error Handling & Loading States)
 * Part of Step 6 optimization (Performance Optimization)
 * v1.12.500 - Memoized with React.memo to prevent unnecessary re-renders
 * 
 * Usage:
 *   <LoadingSpinner />
 *   <LoadingSpinner size="lg" message="Loading your data..." />
 */

import { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'loading-spinner-sm',
  md: 'loading-spinner-md',
  lg: 'loading-spinner-lg',
};

export const LoadingSpinner = memo(function LoadingSpinner({ 
  size = 'md', 
  message,
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner-container ${className}`.trim()}>
      <Loader2 className={`loading-spinner ${sizeClasses[size]}`} />
      {message && (
        <p className="loading-spinner-message">
          {message}
        </p>
      )}
    </div>
  );
});