"use client";

import React, { useEffect, useState, useCallback, ComponentType, ReactElement, useMemo } from 'react';

// Enhanced loading state interface
interface LoadingState {
  isReady: boolean;
  isLoading: boolean;
  hasError: boolean;
  loadTime: number | null;
  progress: number;
}

// Configuration options for the loader
interface LoaderConfig {
  timeout?: number; // Maximum time to wait before forcing ready state
  showProgress?: boolean; // Whether to show loading progress
  minLoadTime?: number; // Minimum time to show loader (prevents flash)
  enableAnalytics?: boolean; // Track loading performance
  retryAttempts?: number; // Number of retry attempts on error
}

// Default configuration
const defaultConfig: LoaderConfig = {
  timeout: 10000, // 10 seconds
  showProgress: true,
  minLoadTime: 500, // 500ms minimum
  enableAnalytics: true,
  retryAttempts: 3,
};

// Enhanced page loader hook
function useEnhancedPageLoader<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback: ReactElement | ((state: LoadingState) => ReactElement),
  config: LoaderConfig = {}
): ComponentType<P> {

  return function EnhancedLoaderWrapper(props: P): ReactElement {
    const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
    
    const [loadingState, setLoadingState] = useState<LoadingState>({
      isReady: false,
      isLoading: true,
      hasError: false,
      loadTime: null,
      progress: 0,
    });

    const [startTime] = useState(() => Date.now());
    const [retryCount, setRetryCount] = useState(0);

    // Progress simulation for better UX
    useEffect(() => {
      if (!mergedConfig.showProgress || loadingState.isReady) return;

      const progressInterval = setInterval(() => {
        setLoadingState(prev => {
          if (prev.isReady) return prev;
          
          // Simulate organic progress curve
          const elapsed = Date.now() - startTime;
          const timeoutProgress = Math.min((elapsed / (mergedConfig.timeout || 10000)) * 100, 95);
          const organicProgress = Math.min(prev.progress + Math.random() * 5, timeoutProgress);
          
          return {
            ...prev,
            progress: Math.round(organicProgress),
          };
        });
      }, 100);

      return () => clearInterval(progressInterval);
    }, [loadingState.isReady, startTime, mergedConfig.timeout, mergedConfig.showProgress]);

    // Enhanced ready state handler
    const handleReady = useCallback(() => {
      const loadTime = Date.now() - startTime;
      
      // Respect minimum load time for better UX
      const remainingMinTime = (mergedConfig.minLoadTime || 0) - loadTime;
      
      const finalizeReady = () => {
        setLoadingState(prev => ({
          ...prev,
          isReady: true,
          isLoading: false,
          loadTime,
          progress: 100,
        }));

        // Analytics tracking
        if (mergedConfig.enableAnalytics) {
          console.log(`Page loaded in ${loadTime}ms`);
          
          // Send to analytics service if available
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'page_load_time', {
              custom_parameter: loadTime,
            });
          }
        }
      };

      if (remainingMinTime > 0) {
        setTimeout(finalizeReady, remainingMinTime);
      } else {
        finalizeReady();
      }
    }, [startTime, mergedConfig.minLoadTime, mergedConfig.enableAnalytics]);

    // Error handling with retry logic
    const handleError = useCallback((event: ErrorEvent) => {
      console.error('Page loading error:', event.error || event.message);
      
      if (retryCount < (mergedConfig.retryAttempts || 0)) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          setLoadingState(prev => ({
            ...prev,
            hasError: false,
            isLoading: true,
          }));
        }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        setLoadingState(prev => ({
          ...prev,
          hasError: true,
          isLoading: false,
        }));
      }
    }, [retryCount, mergedConfig.retryAttempts]);

    // Main loading effect
    useEffect(() => {
      // Check if already loaded
      if (document.readyState === 'complete') {
        handleReady();
        return;
      }

      // Multiple loading strategies
      const handleLoad = () => handleReady();
      const handleDOMContentLoaded = () => {
        // Partial ready state for DOM content
        setLoadingState(prev => ({
          ...prev,
          progress: Math.max(prev.progress, 60),
        }));
      };

      // Add event listeners
      window.addEventListener('load', handleLoad);
      window.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
      window.addEventListener('error', handleError);

      // Timeout fallback
      const timeoutId = setTimeout(() => {
        if (!loadingState.isReady) {
          console.warn('Page load timeout reached, forcing ready state');
          handleReady();
        }
      }, mergedConfig.timeout);

      // Cleanup
      return () => {
        window.removeEventListener('load', handleLoad);
        window.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
        window.removeEventListener('error', handleError);
        clearTimeout(timeoutId);
      };
    }, [handleReady, handleError, loadingState.isReady, mergedConfig.timeout]);

    // Render logic
    if (loadingState.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Loading Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Something went wrong while loading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    if (!loadingState.isReady) {
      // Enhanced fallback with loading state
      if (typeof fallback === 'function') {
        return fallback(loadingState);
      }
      return fallback;
    }

    return <WrappedComponent {...props} />;
  };
}

// Legacy hook for backward compatibility
function useFullPageLoader<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback: ReactElement
): ComponentType<P> {
  return useEnhancedPageLoader(WrappedComponent, fallback, {
    showProgress: false,
    enableAnalytics: false,
  });
}

// Hook for just loading state (without HOC)
export const useLoadingState = (config: LoaderConfig = {}) => {
  const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isReady: false,
    isLoading: true,
    hasError: false,
    loadTime: null,
    progress: 0,
  });

  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (document.readyState === 'complete') {
      const loadTime = Date.now() - startTime;
      setLoadingState({
        isReady: true,
        isLoading: false,
        hasError: false,
        loadTime,
        progress: 100,
      });
    } else {
      const handleLoad = () => {
        const loadTime = Date.now() - startTime;
        setLoadingState({
          isReady: true,
          isLoading: false,
          hasError: false,
          loadTime,
          progress: 100,
        });
      };

      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [startTime]);

  return loadingState;
};

// Export enhanced version as default
export default useEnhancedPageLoader;

// Export legacy version for backward compatibility
export { useFullPageLoader };

// Export types
export type { LoadingState, LoaderConfig };
