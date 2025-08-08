// Authentication service for the application
import { authService, apiService } from '@/services/api';
import type { ApiResponse, AuthTokens } from '@/services/api';

// Auth-related types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  tokenType: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface ValidationResponse {
  message: string;
  username: string;
  isAuthenticated: boolean;
}

// Authentication service class
export class AuthService {
  // Login user with username/password
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await authService.post<LoginResponse>('/login/authenticate', credentials);
    
    // Automatically set tokens in the API service after successful login
    if (response.success && response.data) {
      const authTokens: AuthTokens = {
        accessToken: response.data.token,
        tokenType: response.data.tokenType || 'Bearer',
        // Note: Login server doesn't provide refresh tokens yet
      };
      apiService.setAuthTokens(authTokens);
      authService.setAuthTokens(authTokens);
      
      // Store tokens in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('authTokens', JSON.stringify(authTokens));
        localStorage.setItem('loginResponse', JSON.stringify(response.data));
      }
    }
    
    return response;
  }

  // Quick login for testing
  static async quickLogin(): Promise<ApiResponse<LoginResponse>> {
    const response = await authService.post<LoginResponse>('/login/quick-login');
    
    // Automatically set tokens after successful quick login
    if (response.success && response.data) {
      const authTokens: AuthTokens = {
        accessToken: response.data.token,
        tokenType: response.data.tokenType || 'Bearer',
      };
      apiService.setAuthTokens(authTokens);
      authService.setAuthTokens(authTokens);
      
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authTokens', JSON.stringify(authTokens));
        localStorage.setItem('loginResponse', JSON.stringify(response.data));
      }
    }
    
    return response;
  }

  // Logout user
  static async logout(): Promise<ApiResponse<void>> {
    // Clear tokens from services
    apiService.clearAuthTokens();
    authService.clearAuthTokens();
    
    // Clear tokens from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authTokens');
      localStorage.removeItem('loginResponse');
    }
    
    return {
      data: undefined,
      success: true,
      status: 200,
      message: 'Logged out successfully',
    };
  }

  // Validate current token
  static async validateToken(): Promise<ApiResponse<ValidationResponse>> {
    try {
      return await authService.get<ValidationResponse>('/login/validate');
    } catch (error) {
      // For 401 errors, return a failed response instead of throwing
      const apiError = error as { status?: number; message?: string };
      if (apiError.status === 401) {
        return {
          data: undefined as any,
          success: false,
          status: 401,
          message: 'Token is invalid or expired',
        };
      }
      // Re-throw other errors
      throw error;
    }
  }

  // Initialize authentication state from localStorage
  static initializeAuth(): void {
    if (typeof window !== 'undefined') {
      const storedTokens = localStorage.getItem('authTokens');
      if (storedTokens) {
        try {
          const tokens: AuthTokens = JSON.parse(storedTokens);
          apiService.setAuthTokens(tokens);
          authService.setAuthTokens(tokens);
        } catch (error) {
          console.error('Error parsing stored auth tokens:', error);
          localStorage.removeItem('authTokens');
          localStorage.removeItem('loginResponse');
        }
      }
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const tokens = apiService.getAuthTokens();
    return !!tokens?.accessToken;
  }

  // Get current tokens
  static getCurrentTokens(): AuthTokens | null {
    return apiService.getAuthTokens();
  }

  // Get stored login response for user info
  static getStoredLoginResponse(): LoginResponse | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('loginResponse');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error('Error parsing stored login response:', error);
          return null;
        }
      }
    }
    return null;
  }
}

// Export individual methods for convenience
export const {
  login,
  quickLogin,
  logout,
  validateToken,
  initializeAuth,
  isAuthenticated,
  getCurrentTokens,
  getStoredLoginResponse,
} = AuthService;