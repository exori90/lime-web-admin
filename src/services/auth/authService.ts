// Authentication service for the application
import { authService, apiService } from '@/services/api';
import type { ApiResponse, AuthTokens } from '@/services/api';

// Auth-related types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

// Authentication service class
export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await authService.post<LoginResponse>('/login', credentials);
    
    // Automatically set tokens in the main API service after successful login
    if (response.success && response.data.tokens) {
      apiService.setAuthTokens(response.data.tokens);
      authService.setAuthTokens(response.data.tokens);
      
      // Store tokens in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('authTokens', JSON.stringify(response.data.tokens));
      }
    }
    
    return response;
  }

  // Register new user
  static async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await authService.post<LoginResponse>('/register', userData);
    
    // Automatically set tokens after successful registration
    if (response.success && response.data.tokens) {
      apiService.setAuthTokens(response.data.tokens);
      authService.setAuthTokens(response.data.tokens);
      
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authTokens', JSON.stringify(response.data.tokens));
      }
    }
    
    return response;
  }

  // Logout user
  static async logout(): Promise<ApiResponse<void>> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await authService.post<void>('/logout');
    } catch (error) {
      console.warn('Logout endpoint failed, proceeding with local cleanup:', error);
    } finally {
      // Clear tokens from services
      apiService.clearAuthTokens();
      authService.clearAuthTokens();
      
      // Clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authTokens');
      }
    }
    
    return {
      data: undefined,
      success: true,
      status: 200,
      message: 'Logged out successfully',
    };
  }

  // Refresh access token
  static async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    const currentTokens = apiService.getAuthTokens();
    
    if (!currentTokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await authService.post<RefreshTokenResponse>('/refresh', {
      refreshToken: currentTokens.refreshToken,
    });

    // Update tokens in services
    if (response.success && response.data.tokens) {
      apiService.setAuthTokens(response.data.tokens);
      authService.setAuthTokens(response.data.tokens);
      
      // Update tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authTokens', JSON.stringify(response.data.tokens));
      }
    }

    return response;
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return authService.post<{ message: string }>('/forgot-password', { email });
  }

  // Reset password
  static async resetPassword(
    token: string, 
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return authService.post<{ message: string }>('/reset-password', {
      token,
      password: newPassword,
    });
  }

  // Change password (for authenticated users)
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return authService.post<{ message: string }>('/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Verify email
  static async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    return authService.post<{ message: string }>('/verify-email', { token });
  }

  // Resend verification email
  static async resendVerification(): Promise<ApiResponse<{ message: string }>> {
    return authService.post<{ message: string }>('/resend-verification');
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
}

// Export individual methods for convenience
export const {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification,
  initializeAuth,
  isAuthenticated,
  getCurrentTokens,
} = AuthService;