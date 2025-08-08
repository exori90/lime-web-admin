import { ApiServiceConfig } from './types';

// Environment detection
const getEnvironment = (): string => {
  return process.env.NODE_ENV || 'development';
};

const getAppEnvironment = (): string => {
  return process.env.NEXT_PUBLIC_APP_ENV || getEnvironment();
};

// Environment-specific configuration factory (partial config)
const createEnvConfig = (env: string) => {
  const configs = {
    development: {
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000'),
      retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '2'),
      retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '500'),
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Environment': 'development',
        'X-App-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-dev',
      },
    },
    test: {
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
      retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '3'),
      retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000'),
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Environment': 'test',
        'X-App-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-test',
      },
    },
    production: {
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
      retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '3'),
      retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000'),
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Environment': 'production',
        'X-App-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      },
    },
  };

  return configs[env as keyof typeof configs] || configs.development;
};

// Get base configuration for current environment
const getApiConfig = (): ApiServiceConfig => {
  const env = getAppEnvironment();
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || getDefaultBaseURL(env);
  const envConfig = createEnvConfig(env);
  
  return {
    baseURL,
    ...envConfig,
  };
};

// Default base URLs for different environments
const getDefaultBaseURL = (env: string): string => {
  const defaults = {
    development: 'http://localhost:3001/api',
    test: 'https://api.nektar.gg/api',
    production: 'https://api.nektar.gg/api',
  };
  
  return defaults[env as keyof typeof defaults] || defaults.development;
};

// Environment-specific configurations
export const devApiConfig: ApiServiceConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  ...createEnvConfig('development'),
};

export const testApiConfig: ApiServiceConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.nektar.gg/api',
  ...createEnvConfig('test'),
};

export const prodApiConfig: ApiServiceConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.nektar.gg/api',
  ...createEnvConfig('production'),
};

// Export the configuration based on current environment
export const apiConfig = getApiConfig();

// Feature flags from environment
export const featureFlags = {
  enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  enableMockAPI: process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
};

// App configuration
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Lime Web Admin',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: getAppEnvironment(),
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5') * 1024 * 1024, // Convert MB to bytes
  allowedFileTypes: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  cacheTTL: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300000'),
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL,
};

// Get default URLs for different services based on environment
const getDefaultAuthURL = (env: string): string => {
  const defaults = {
    development: 'http://localhost:5000/api',
    test: 'https://login.nektar.gg/api',
    production: 'https://login.nektar.gg/api',
  };
  return defaults[env as keyof typeof defaults] || defaults.development;
};

const getDefaultOrchestratorURL = (env: string): string => {
  const defaults = {
    development: 'http://localhost:3002/api',
    test: 'https://orchestrator.nektar.gg/api',
    production: 'https://orchestrator.nektar.gg/api',
  };
  return defaults[env as keyof typeof defaults] || defaults.development;
};

// Multiple API service configurations for different services
export const apiConfigs = {
  main: apiConfig,
  auth: {
    ...apiConfig,
    baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || getDefaultAuthURL(getAppEnvironment()),
  },
  users: {
    ...apiConfig,
    baseURL: process.env.NEXT_PUBLIC_USERS_API_URL || `${apiConfig.baseURL}/users`,
  },
  files: {
    ...apiConfig,
    baseURL: process.env.NEXT_PUBLIC_FILES_API_URL || `${apiConfig.baseURL}/files`,
    timeout: 30000, // Longer timeout for file operations
  },
  orchestrator: {
    ...apiConfig,
    baseURL: process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || getDefaultOrchestratorURL(getAppEnvironment()),
    timeout: 15000, // Longer timeout for monitoring operations
  },
};

// Environment validation
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const env = getAppEnvironment();

  // Required environment variables
  const required = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];

  // Production-specific validations
  if (env === 'production') {
    required.push(
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
    );
    
    // Check for secure secrets in production
    if (process.env.JWT_SECRET?.includes('CHANGE_THIS')) {
      errors.push('JWT_SECRET must be changed in production');
    }
    
    if (process.env.JWT_REFRESH_SECRET?.includes('CHANGE_THIS')) {
      errors.push('JWT_REFRESH_SECRET must be changed in production');
    }
  }

  // Check required variables
  for (const variable of required) {
    if (!process.env[variable]) {
      errors.push(`Missing required environment variable: ${variable}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Log environment info (only in development)
if (getAppEnvironment() === 'development' && featureFlags.enableDebug) {
  console.log('🔧 Environment Configuration:', {
    environment: getAppEnvironment(),
    nodeEnv: getEnvironment(),
    apiBaseURL: apiConfig.baseURL,
    featureFlags,
    appConfig: {
      name: appConfig.name,
      version: appConfig.version,
    },
  });
}