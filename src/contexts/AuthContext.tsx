'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, AuthService, ValidationResponse } from '@/services/auth/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  quickLogin: () => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const validateToken = async () => {
    try {
      const response = await AuthService.validateToken();
      if (response.success && response.data) {
        setUser({
          username: response.data.username,
          isAuthenticated: response.data.isAuthenticated,
        });
      } else {
        // Token is invalid or expired (401, etc.)
        console.log('Token validation failed: invalid or expired token');
        
        // Clear any stored tokens that are invalid
        await AuthService.logout();
        setUser(null);
      }
    } catch (error) {
      // Handle unexpected errors (network issues, etc.)
      console.error('Unexpected error during token validation:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await AuthService.login(credentials);
      if (response.success && response.data) {
        // Set user state directly from login response
        setUser({
          username: credentials.username,
          isAuthenticated: true,
        });
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const quickLogin = async () => {
    try {
      console.log('🎯 AuthContext: Starting quick login...');
      setLoading(true);
      const response = await AuthService.quickLogin();
      console.log('🎯 AuthContext: Got response:', response);
      
      if (response.success && response.data) {
        console.log('🎯 AuthContext: Setting user state...');
        // Set user state directly from quick login response
        setUser({
          username: 'testuser', // Default quick login username
          isAuthenticated: true,
        });
        setLoading(false);
        console.log('🎯 AuthContext: User state set, loading false');
      } else {
        console.error('🎯 AuthContext: Login failed:', response);
        setLoading(false);
        throw new Error(response.message || 'Quick login failed');
      }
    } catch (error) {
      console.error('🎯 AuthContext: Quick login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  useEffect(() => {
    // Initialize auth state from localStorage
    AuthService.initializeAuth();
    
    if (AuthService.isAuthenticated()) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    quickLogin,
    logout,
    validateToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};