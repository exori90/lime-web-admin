# API Service Documentation

A comprehensive, reusable API service layer for React/Next.js applications with TypeScript support.

## 🚀 Features

- **TypeScript Support**: Fully typed API responses and requests
- **Multiple Service Instances**: Different configurations for different APIs (auth, users, files, etc.)
- **Error Handling**: Comprehensive error handling with retry logic
- **Authentication**: Built-in JWT token management
- **React Hooks**: Custom hooks for easy API integration in components
- **Caching**: Built-in response caching
- **File Uploads**: Support for file upload operations
- **Interceptors**: Request and response interceptors
- **Environment Configuration**: Environment-based API configuration

## 📁 Structure

```
src/services/
├── api/
│   ├── base.ts           # Core API service class
│   ├── config.ts         # API configuration
│   ├── index.ts          # Main exports
│   └── types.ts          # TypeScript interfaces
├── auth/
│   └── authService.ts    # Authentication service
├── users/
│   └── userService.ts    # User management service
├── hooks/
│   └── useApi.ts         # Custom React hooks
├── utils/
│   └── apiHelpers.ts     # Utility functions
└── index.ts              # Main services export
```

## 🔧 Setup

### 1. Environment Variables

Create a `.env.local` file with your API endpoints:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001/api/auth
NEXT_PUBLIC_USERS_API_URL=http://localhost:3001/api/users
NEXT_PUBLIC_FILES_API_URL=http://localhost:3001/api/files
```

### 2. Initialize Authentication

Add this to your root layout or app component:

```tsx
// app/layout.tsx or pages/_app.tsx
import { AuthService } from '@/services/examples/authService';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize auth state from localStorage
    AuthService.initializeAuth();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## 📖 Usage

### Basic API Service

```tsx
import { apiService } from '@/services/api';

// GET request
const response = await apiService.get('/users');

// POST request
const newUser = await apiService.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updatedUser = await apiService.put('/users/123', userData);

// DELETE request
await apiService.delete('/users/123');
```

### Using Custom Services

```tsx
import { UserService } from '@/services/users/userService';
import { AuthService } from '@/services/auth/authService';

// User operations
const users = await UserService.getUsers({ page: 1, limit: 10 });
const user = await UserService.getUserById('123');
const newUser = await UserService.createUser(userData);

// Authentication
const loginResponse = await AuthService.login({
  email: 'user@example.com',
  password: 'password123'
});
```

### Using React Hooks

```tsx
import { useQuery, useMutation } from '@/services/hooks/useApi';
import { UserService } from '@/services/users/userService';

function UsersComponent() {
  // Fetch data with automatic loading states
  const {
    data: users,
    loading,
    error,
    refetch
  } = useQuery(
    () => UserService.getUsers(),
    { immediate: true }
  );

  // Create user mutation
  const {
    execute: createUser,
    loading: creating,
    error: createError
  } = useMutation(
    (userData) => UserService.createUser(userData),
    {
      onSuccess: () => {
        refetch(); // Refresh the users list
      }
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users?.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={() => createUser(newUserData)}>
        {creating ? 'Creating...' : 'Create User'}
      </button>
    </div>
  );
}
```

### File Upload

```tsx
import { filesService } from '@/services/api';

const handleFileUpload = async (file: File) => {
  try {
    const response = await filesService.uploadFile('/upload', file, {
      folder: 'avatars',
      resize: true
    });
    console.log('File uploaded:', response.data);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Error Handling

```tsx
import { handleApiError } from '@/services/utils/apiHelpers';

try {
  const response = await apiService.get('/users');
} catch (error) {
  const userFriendlyMessage = handleApiError(error);
  // Show user-friendly error message
}
```

### Caching

```tsx
import { apiCache, ApiCache } from '@/services/utils/apiHelpers';

// Cache API response
const cacheKey = ApiCache.generateKey('/users', { page: 1 });
const cachedData = apiCache.get(cacheKey);

if (cachedData) {
  return cachedData;
} else {
  const response = await apiService.get('/users');
  apiCache.set(cacheKey, response.data, 300000); // Cache for 5 minutes
  return response.data;
}
```

## 🔐 Authentication

The API service includes built-in authentication token management:

```tsx
import { AuthService } from '@/services/auth/authService';

// Login
const response = await AuthService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Tokens are automatically set in all API services

// Check authentication status
const isLoggedIn = AuthService.isAuthenticated();

// Logout
await AuthService.logout();
```

## ⚙️ Configuration

### Custom API Service

```tsx
import { ApiService } from '@/services/api';

const customService = new ApiService({
  baseURL: 'https://custom-api.example.com',
  timeout: 15000,
  defaultHeaders: {
    'X-Custom-Header': 'value'
  },
  retries: 5
});
```

### Request Interceptors

```tsx
apiService.setRequestInterceptor((config) => {
  // Add custom headers or modify request
  config.headers = {
    ...config.headers,
    'X-Request-ID': generateRequestId()
  };
  return config;
});
```

### Response Interceptors

```tsx
apiService.setResponseInterceptor((response) => {
  // Log responses or transform data
  console.log('API Response:', response);
  return response;
});
```

## 🔄 Advanced Usage

### Paginated Queries

```tsx
import { usePaginatedQuery } from '@/services/hooks/useApi';
import { UserService } from '@/services/users/userService';

function PaginatedUsers() {
  const {
    data,
    loading,
    page,
    nextPage,
    prevPage,
    fetchPage
  } = usePaginatedQuery(
    (page, limit) => UserService.getUsers({ page, limit }),
    1, // initial page
    10 // initial limit
  );

  return (
    <div>
      {/* Render users */}
      <button onClick={prevPage}>Previous</button>
      <span>Page {page}</span>
      <button onClick={nextPage}>Next</button>
    </div>
  );
}
```

### Auto-refresh Queries

```tsx
import { useQuery } from '@/services/hooks/useApi';
import { UserService } from '@/services/users/userService';

const { data, loading } = useQuery(
  () => UserService.getUsers(),
  {
    immediate: true,
    refetchInterval: 30000 // Refetch every 30 seconds
  }
);
```

### Conditional Queries

```tsx
import { useQuery } from '@/services/hooks/useApi';
import { UserService } from '@/services/users/userService';

const { data, loading } = useQuery(
  () => UserService.getUserById(userId),
  {
    enabled: !!userId, // Only fetch if userId exists
    immediate: !!userId
  }
);
```

## 🛠️ Utility Functions

```tsx
import { 
  buildQueryString, 
  validateFileType, 
  validateFileSize,
  debounce 
} from '@/services/utils/apiHelpers';

// Build query string
const queryString = buildQueryString({ page: 1, search: 'john' });
// Result: "?page=1&search=john"

// File validation
const isValidType = validateFileType(file, ['image/jpeg', 'image/png']);
const isValidSize = validateFileSize(file, 5); // 5MB max

// Debounced search
const debouncedSearch = debounce((query) => {
  searchUsers(query);
}, 300);
```

## 🚨 Error Handling

The API service provides comprehensive error handling:

- **Network errors**: Connection issues, timeouts
- **HTTP errors**: 4xx and 5xx status codes
- **Validation errors**: 422 status with detailed field errors
- **Authentication errors**: 401/403 with automatic token refresh
- **Rate limiting**: 429 status with retry logic

## 📱 TypeScript Support

All services are fully typed for better development experience:

```tsx
// Interfaces are exported for use in your components
import type { User, CreateUserRequest, ApiResponse } from '@/services/api';

const handleCreateUser = async (userData: CreateUserRequest): Promise<User> => {
  const response: ApiResponse<User> = await UserService.createUser(userData);
  return response.data;
};
```

## 🔧 Customization

You can extend the base services or create new ones:

```tsx
// Custom service extending UserService
export class AdminUserService extends UserService {
  static async banUser(userId: string): Promise<ApiResponse<void>> {
    return apiService.post(`/admin/users/${userId}/ban`);
  }
  
  static async getAuditLog(userId: string): Promise<ApiResponse<AuditLog[]>> {
    return apiService.get(`/admin/users/${userId}/audit`);
  }
}
```

This API service provides a solid foundation for handling all your API communication needs with proper TypeScript support, error handling, and React integration.