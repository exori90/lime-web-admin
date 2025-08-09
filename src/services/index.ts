// Main services export file
export * from './api';

// Auth exports with explicit naming to avoid conflicts
export { AuthService } from './auth/authService';
export type {
  LoginRequest,
  LoginResponse,
  ValidationResponse,
  User as AuthUser,
} from './auth/authService';
export {
  login,
  quickLogin,
  logout,
  validateToken,
  initializeAuth,
  isAuthenticated,
  getCurrentTokens,
  getStoredLoginResponse,
} from './auth/authService';

// User service exports with explicit naming
export { UserService } from './users/userService';
export type {
  User as ServiceUser,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
} from './users/userService';

export * from './monitoring/orchestratorService';
export * from './signalr/gameWorldService';
export * from './hooks/useApi';
export * from './utils/apiHelpers';