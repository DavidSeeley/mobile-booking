/**
 * =========================================================================
 * ErrorBoundary Component
 * =========================================================================
 * A React error boundary that catches JavaScript errors anywhere in the
 * child component tree, logs them, and displays a fallback UI.
 * 
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 * 
 * v1.12.400
 */

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in production, you might send to an error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-boundary-icon-wrapper">
              <AlertTriangle className="error-boundary-icon" />
            </div>
            
            <h1 className="error-boundary-title">
              Something went wrong
            </h1>
            
            <p className="error-boundary-message">
              We're sorry, but something unexpected happened. You can try refreshing the page or returning to the home screen.
            </p>

            {this.state.error && (
              <div className="error-boundary-error-details">
                <p className="error-boundary-error-name">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}

            <div className="error-boundary-actions">
              <button
                type="button"
                onClick={this.handleReset}
                className="error-boundary-btn error-boundary-btn-primary"
              >
                <RefreshCw className="error-boundary-btn-icon" />
                Try Again
              </button>
              
              <button
                type="button"
                onClick={this.handleGoHome}
                className="error-boundary-btn error-boundary-btn-secondary"
              >
                <Home className="error-boundary-btn-icon" />
                Go Home
              </button>
            </div>

            {/* Development-only stack trace */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="error-boundary-stack-trace">
                <summary className="error-boundary-stack-summary">
                  Show technical details
                </summary>
                <pre className="error-boundary-stack-pre">
                  {this.state.error?.stack}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
