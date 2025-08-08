// Main API service exports
export { ApiService } from './base';
export * from './types';
export * from './config';

// Create API service instances
import { ApiService } from './base';
import { apiConfigs, appConfig } from './config';

// Main API service instance (for web server)
export const apiService = new ApiService(apiConfigs.main);

// Specialized service instances
export const authService = new ApiService(apiConfigs.auth);
export const orchestratorService = new ApiService(apiConfigs.orchestrator);

// Service instances object for easier access
export const services = {
  api: apiService,
  auth: authService,
  orchestrator: orchestratorService,
};

// Export configuration utilities
export { appConfig };

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