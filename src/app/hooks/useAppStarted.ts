/**
 * useAppStarted Hook
 * Redirects to splash page if app hasn't been started
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function useAppStarted() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.__appStarted) {
      navigate('/', { replace: true });
    }
  }, [navigate]);
}