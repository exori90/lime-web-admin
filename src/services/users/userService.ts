// User management service for the application
import { apiService } from '@/services/api';
import type { ApiResponse } from '@/services/api';

// Define user-related types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: User['role'];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
  role?: User['role'];
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

// User service class with specific methods
export class UserService {
  // Get all users with pagination
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: User['role'];
  }): Promise<ApiResponse<UsersListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return apiService.get<UsersListResponse>(endpoint);
  }

  // Get user by ID
  static async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiService.get<User>(`/users/${id}`);
  }

  // Create new user
  static async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiService.post<User>('/users', userData);
  }

  // Update user
  static async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiService.patch<User>(`/users/${id}`, userData);
  }

  // Delete user
  static async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/users/${id}`);
  }

  // Upload user avatar
  static async uploadAvatar(userId: string, file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    return apiService.uploadFile<{ avatarUrl: string }>(
      `/users/${userId}/avatar`,
      file,
      { userId }
    );
  }

  // Get current user profile (requires authentication)
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiService.get<User>('/users/me');
  }

  // Update current user profile
  static async updateCurrentUser(userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiService.patch<User>('/users/me', userData);
  }
}

// Export individual methods for convenience
export const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadAvatar,
  getCurrentUser,
  updateCurrentUser,
} = UserService;