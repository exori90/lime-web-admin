// API Types and Interfaces

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface ApiServiceConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  config?: RequestConfig;
}

// Generic API endpoints interface
export interface ApiEndpoints {
  [key: string]: {
    url: string;
    method: HttpMethod;
    requiresAuth?: boolean;
  };
}

// Auth token interface
export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
}