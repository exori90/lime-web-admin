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
interface ApiHookResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
  execute: () => Promise<ApiResponse<T>>;
  reset: () => void;
}

interface UseApiOptions<T = unknown> {
  immediate?: boolean; // Execute immediately on mount
  onSuccess?: (data: T | null) => void;
  onError?: (error: ApiError) => void;
}

// Main useApi hook
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): ApiHookResult<T> {
  const { immediate = false, onSuccess, onError } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (): Promise<ApiResponse<T>> => {
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
  const reset = useCallback((): void => {
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
): {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
  execute: (...params: P) => Promise<ApiResponse<T>>;
  reset: () => void;
} {
  const { onSuccess, onError } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (...params: P): Promise<ApiResponse<T>> => {
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

  const reset = useCallback((): void => {
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
): {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
  execute: (...params: P) => Promise<ApiResponse<T>>;
  reset: () => void;
} {
  return useApiWithParams(mutationFn, options);
}

// Hook for queries with auto-refetch capabilities
export function useQuery<T>(
  queryFn: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> & {
    refetchInterval?: number;
    enabled?: boolean;
  } = {}
): {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
  execute: () => Promise<ApiResponse<T>>;
  reset: () => void;
  refetch: () => Promise<ApiResponse<T>>;
} {
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
  }, [refetchInterval, enabled, apiHook]);

  return {
    ...apiHook,
    refetch: apiHook.execute,
  };
}

// Hook for paginated data
export function usePaginatedQuery<T>(
  queryFn: (page: number, limit: number) => Promise<ApiResponse<T>>,
  initialPage = 1,
  initialLimit = 10,
  options: UseApiOptions<T> = {}
): {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
  execute: (page: number, limit: number) => Promise<ApiResponse<T>>;
  reset: () => void;
  page: number;
  limit: number;
  fetchPage: (newPage: number, newLimit?: number) => Promise<ApiResponse<T>>;
  nextPage: () => Promise<ApiResponse<T> | undefined>;
  prevPage: () => Promise<ApiResponse<T> | undefined>;
  firstPage: () => Promise<ApiResponse<T>>;
  setLimit: (limit: number) => void;
} {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const apiHook = useApiWithParams(queryFn, options);

  const fetchPage = useCallback((newPage: number, newLimit?: number): Promise<ApiResponse<T>> => {
    const pageLimit = newLimit || limit;
    setPage(newPage);
    if (newLimit) setLimit(newLimit);
    return apiHook.execute(newPage, pageLimit);
  }, [apiHook, limit]);

  const nextPage = useCallback((): Promise<ApiResponse<T> | undefined> => {
    return fetchPage(page + 1);
  }, [fetchPage, page]);

  const prevPage = useCallback((): Promise<ApiResponse<T> | undefined> => {
    if (page > 1) {
      return fetchPage(page - 1);
    }
  }, [fetchPage, page]);

  const firstPage = useCallback((): Promise<ApiResponse<T>> => {
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