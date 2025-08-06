// Custom React hooks for API calls
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, ApiError } from '@/services/api';

// Generic API hook state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

// Options for the API hook
interface UseApiOptions<T = unknown> {
  immediate?: boolean; // Execute immediately on mount
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

// Main useApi hook
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const { immediate = false, onSuccess, onError } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall();
      
      setState({
        data: response.data,
        loading: false,
        error: null,
        success: response.success,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      
      setState({
        data: null,
        loading: false,
        error: apiError,
        success: false,
      });

      if (onError) {
        onError(apiError);
      }

      throw error;
    }
  }, [apiCall, onSuccess, onError]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  // Execute on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for API calls with parameters
export function useApiWithParams<T, P extends unknown[]>(
  apiCall: (...params: P) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const { onSuccess, onError } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (...params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall(...params);
      
      setState({
        data: response.data,
        loading: false,
        error: null,
        success: response.success,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      
      setState({
        data: null,
        loading: false,
        error: apiError,
        success: false,
      });

      if (onError) {
        onError(apiError);
      }

      throw error;
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for mutations (POST, PUT, DELETE operations)
export function useMutation<T, P extends unknown[]>(
  mutationFn: (...params: P) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  return useApiWithParams(mutationFn, options);
}

// Hook for queries with auto-refetch capabilities
export function useQuery<T>(
  queryFn: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> & {
    refetchInterval?: number;
    enabled?: boolean;
  } = {}
) {
  const { refetchInterval, enabled = true, ...restOptions } = options;
  
  const apiHook = useApi(queryFn, {
    ...restOptions,
    immediate: enabled,
  });

  // Auto-refetch at intervals
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => {
        if (!apiHook.loading) {
          apiHook.execute();
        }
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, apiHook.loading, apiHook.execute]);

  return {
    ...apiHook,
    refetch: apiHook.execute,
  };
}

// Hook for paginated data
export function usePaginatedQuery<T>(
  queryFn: (page: number, limit: number) => Promise<ApiResponse<T>>,
  initialPage: number = 1,
  initialLimit: number = 10,
  options: UseApiOptions<T> = {}
) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const apiHook = useApiWithParams(queryFn, options);

  const fetchPage = useCallback((newPage: number, newLimit?: number) => {
    const pageLimit = newLimit || limit;
    setPage(newPage);
    if (newLimit) setLimit(newLimit);
    return apiHook.execute(newPage, pageLimit);
  }, [apiHook, limit]);

  const nextPage = useCallback(() => {
    return fetchPage(page + 1);
  }, [fetchPage, page]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      return fetchPage(page - 1);
    }
  }, [fetchPage, page]);

  const firstPage = useCallback(() => {
    return fetchPage(1);
  }, [fetchPage]);

  // Initial fetch
  useEffect(() => {
    apiHook.execute(page, limit);
  }, [apiHook, page, limit]);

  return {
    ...apiHook,
    page,
    limit,
    fetchPage,
    nextPage,
    prevPage,
    firstPage,
    setLimit,
  };
}