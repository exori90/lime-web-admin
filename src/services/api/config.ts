import { ApiServiceConfig } from './types';

// Simple configuration with defaults that can be overridden by environment variables
const defaultConfig = {
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000'),
  retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '2'),
  retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '500'),
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API service configurations - matching web client structure
export const apiConfigs = {
  // Main web server API
  main: {
    baseURL: process.env.NEXT_PUBLIC_WEB_SERVER_API_URL || 'http://localhost:5001/api',
    ...defaultConfig,
  } as ApiServiceConfig,
  
  // Auth/login server API  
  auth: {
    baseURL: process.env.NEXT_PUBLIC_LOGIN_API_URL || 'http://localhost:5000/api/v1',
    ...defaultConfig,
  } as ApiServiceConfig,

  // Orchestrator API
  orchestrator: {
    baseURL: process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || 'http://localhost:5002/api',
    ...defaultConfig,
    timeout: 15000, // Longer timeout for monitoring operations
  } as ApiServiceConfig,
};

// App configuration
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Lime Web Admin',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
};