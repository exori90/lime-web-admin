import { 
  ApiResponse, 
  ApiError, 
  ApiServiceConfig, 
  RequestOptions,
  AuthTokens 
} from './types';

export class ApiService {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private retries: number;
  private retryDelay: number;
  private authTokens: AuthTokens | null = null;

  constructor(config: ApiServiceConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  // Set authentication tokens
  setAuthTokens(tokens: AuthTokens): void {
    this.authTokens = tokens;
  }

  // Clear authentication tokens
  clearAuthTokens(): void {
    this.authTokens = null;
  }

  // Get current auth tokens
  getAuthTokens(): AuthTokens | null {
    return this.authTokens;
  }

  // Build complete URL
  private buildURL(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    return `${cleanBaseURL}/${cleanEndpoint}`;
  }

  // Build request headers
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    // Add authentication header if tokens are available
    if (this.authTokens?.accessToken) {
      const tokenType = this.authTokens.tokenType || 'Bearer';
      headers.Authorization = `${tokenType} ${this.authTokens.accessToken}`;
    }

    return headers;
  }

  // Handle API errors
  private handleError(error: unknown): ApiError {
    if ((error as Error).name === 'AbortError') {
      return {
        message: 'Request timeout',
        status: 408,
        code: 'TIMEOUT',
      };
    }

    const errorWithResponse = error as { response?: { status: number; data?: unknown } };
    if (!errorWithResponse.response) {
      return {
        message: (error as Error).message || 'Network error',
        status: 0,
        code: 'NETWORK_ERROR',
      };
    }

    const responseData = errorWithResponse.response.data as { message?: string; code?: string } | undefined;
    return {
      message: responseData?.message || (error as Error).message || 'API Error',
      status: errorWithResponse.response.status || 500,
      code: responseData?.code || 'API_ERROR',
      details: errorWithResponse.response.data,
    };
  }

  // Sleep utility for retries
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Core request method with retry logic
  private async makeRequest<T>(
    url: string, 
    options: RequestOptions = {},
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', headers, body, config } = options;
    const fullURL = this.buildURL(url);
    const requestHeaders = this.buildHeaders(headers);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(), 
      config?.timeout || this.timeout
    );

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
      };

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        if (typeof body === 'object' && !(body instanceof FormData)) {
          fetchOptions.body = JSON.stringify(body);
        } else {
          fetchOptions.body = body as BodyInit;
        }
      }

      const response = await fetch(fullURL, fetchOptions);
      clearTimeout(timeoutId);

      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`) as Error & {
          response: { status: number; data: unknown }
        };
        error.response = {
          status: response.status,
          data: responseData,
        };
        throw error;
      }

      return {
        data: responseData,
        status: response.status,
        success: true,
        message: (responseData as { message?: string })?.message,
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retry logic for specific error types
      const errorWithResponse = error as Error & { response?: { status: number } };
      const shouldRetry = attempt < (config?.retries || this.retries) && 
                         (errorWithResponse.name === 'AbortError' || 
                         (errorWithResponse.response?.status && errorWithResponse.response.status >= 500));

      if (shouldRetry) {
        await this.sleep(this.retryDelay * attempt);
        return this.makeRequest<T>(url, options, attempt + 1);
      }

      throw this.handleError(error);
    }
  }

  // HTTP method implementations
  async get<T>(url: string, config?: RequestOptions['config']): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'GET', config });
  }

  async post<T>(
    url: string, 
    data?: unknown, 
    config?: RequestOptions['config']
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'POST', body: data, config });
  }

  async put<T>(
    url: string, 
    data?: unknown, 
    config?: RequestOptions['config']
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'PUT', body: data, config });
  }

  async patch<T>(
    url: string, 
    data?: unknown, 
    config?: RequestOptions['config']
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'PATCH', body: data, config });
  }

  async delete<T>(url: string, config?: RequestOptions['config']): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'DELETE', config });
  }

  // Upload file method
  async uploadFile<T>(
    url: string, 
    file: File, 
    additionalData?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.makeRequest<T>(url, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Request interceptor
  setRequestInterceptor(interceptor: (config: RequestOptions) => RequestOptions): void {
    this.requestInterceptor = interceptor;
  }

  // Response interceptor
  setResponseInterceptor(interceptor: (response: ApiResponse<unknown>) => ApiResponse<unknown>): void {
    this.responseInterceptor = interceptor;
  }

  private requestInterceptor?: (config: RequestOptions) => RequestOptions;
  private responseInterceptor?: (response: ApiResponse<unknown>) => ApiResponse<unknown>;
}