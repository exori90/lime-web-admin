# Quick Start Guide

Get your Lime Web Admin API service up and running in minutes!

## 🚀 Quick Setup

### 1. Environment Setup

The `.env.local` file is already set up for local development! Just check it's working:

```powershell
# Check your environment configuration
npm run env:check
```

You should see output showing:
- Environment: development
- API Base URL: http://localhost:3001/api  
- App Name: Lime Web Admin (Local)

### 2. Start Development

```powershell
# Install dependencies
npm install

# Start development server
npm run dev
```

Your app will be running at [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Commands

| Command | Description |
|---------|-------------|
| `npm run env:check` | Check current environment configuration |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run code linting |

## 📋 Basic Usage

### 1. Simple API Call

```tsx
import { apiService } from '@/services/api';

// GET request
const users = await apiService.get('/users');
console.log(users.data);
```

### 2. Using React Hooks

```tsx
import { useQuery, useMutation } from '@/services/hooks/useApi';
import { UserService } from '@/services/users/userService';

function UsersList() {
  const { data, loading, error } = useQuery(
    () => UserService.getUsers(),
    { immediate: true }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 3. Authentication

```tsx
import { AuthService } from '@/services/auth/authService';

// Login
const response = await AuthService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Logout
await AuthService.logout();

// Check if authenticated
const isLoggedIn = AuthService.isAuthenticated();
```

## 🏗️ Project Structure

```
src/
├── services/
│   ├── api/           # Core API service
│   ├── auth/          # Authentication service
│   ├── users/         # User management service
│   ├── hooks/         # React hooks for API calls
│   ├── utils/         # Utility functions
│   └── index.ts       # Main services export
├── app/               # Next.js app directory
└── components/        # React components (add your own)
```

## 🌍 Multiple Environments

### Development
- Uses `http://localhost:3001/api`
- Debug mode enabled
- Extended timeouts for easier debugging

### Test
- Uses staging API endpoints
- Moderate timeouts
- Test-specific configurations

### Production
- Uses production API endpoints
- Optimized for performance
- Analytics enabled
- Security validations

## 🔐 Authentication Flow

1. **Login**: Call `AuthService.login()` - tokens are automatically stored
2. **API Calls**: All subsequent API calls automatically include auth headers
3. **Token Refresh**: Tokens are automatically refreshed when needed
4. **Logout**: Call `AuthService.logout()` - tokens are cleared

## 📦 File Uploads

```tsx
import { filesService } from '@/services/api';

const uploadFile = async (file: File) => {
  const response = await filesService.uploadFile('/upload', file, {
    folder: 'documents',
    resize: true
  });
  return response.data.url;
};
```

## 🔍 Error Handling

```tsx
import { handleApiError } from '@/services/utils/apiHelpers';

try {
  const result = await apiService.get('/data');
} catch (error) {
  const message = handleApiError(error);
  // Show user-friendly error message
}
```

## 🛠️ Configuration

All configuration is handled through environment variables:

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_API_TIMEOUT=15000
```

See [Environment Setup Guide](./environment-setup.md) for complete configuration options.

## 🚨 Common Issues

### API Calls Not Working
- Check your `.env.local` file exists
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Run `npm run env:check`

### Authentication Issues
- Ensure JWT secrets are set correctly
- Check if tokens are being stored (check localStorage)
- Verify auth endpoints are accessible

### File Upload Issues
- Check file size limits in environment variables
- Verify allowed file types configuration
- Ensure proper file upload endpoint

## 📚 Next Steps

1. **Read the Full Documentation**: Check out [API Service Documentation](../services/README.md)
2. **Explore Examples**: Look at `src/services/examples/` for real usage examples
3. **Customize Services**: Create your own service classes following the patterns
4. **Add Components**: Build your UI components using the provided hooks

## 🆘 Getting Help

- Check the [Environment Setup Guide](./environment-setup.md) for detailed configuration
- Review example components in `docs/examples/components.tsx`
- Check your setup with `npm run env:check`

Happy coding! 🎉