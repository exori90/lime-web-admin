// Main API service exports
export { ApiService } from './base';
export * from './types';
export * from './config';

// Create API service instances
import { ApiService } from './base';
import { apiConfigs, validateEnvironment, featureFlags, appConfig } from './config';

// Validate environment on import (only in development)
if (appConfig.environment === 'development' && featureFlags.enableDebug) {
  const validation = validateEnvironment();
  if (!validation.valid) {
    console.warn('⚠️ Environment validation failed:', validation.errors);
  }
}

// Main API service instance
export const apiService = new ApiService(apiConfigs.main);

// Specialized service instances
export const authService = new ApiService(apiConfigs.auth);
export const usersService = new ApiService(apiConfigs.users);
export const filesService = new ApiService(apiConfigs.files);
export const orchestratorService = new ApiService(apiConfigs.orchestrator);

// Service instances object for easier access
export const services = {
  api: apiService,
  auth: authService,
  users: usersService,
  files: filesService,
  orchestrator: orchestratorService,
};

// Export configuration utilities
export { validateEnvironment, featureFlags, appConfig };

// Re-export types for convenience
export type {
  ApiResponse,
  ApiError,
  RequestConfig,
  ApiServiceConfig,
  HttpMethod,
  RequestOptions,
  ApiEndpoints,
  AuthTokens,
} from './types';