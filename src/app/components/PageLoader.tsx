/**
 * =========================================================================
 * PageLoader Component
 * =========================================================================
 * A full-page loading overlay with spinner and optional message.
 * Used for page transitions and heavy async operations.
 * 
 * Part of Step 5 optimization (Error Handling & Loading States)
 * Part of Step 6 optimization (Performance Optimization)
 * v1.12.500 - Memoized with React.memo to prevent unnecessary re-renders
 * 
 * Usage:
 *   {isLoading && <PageLoader message="Loading your information..." />}
 */

import { memo } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader = memo(function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="page-loader-overlay">
      <div className="page-loader-content">
        <LoadingSpinner size="lg" message={message} />
      </div>
    </div>
  );
});