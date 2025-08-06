# Lime Web Admin

A modern Next.js admin dashboard with a comprehensive, reusable API service layer built with TypeScript.

## 🚀 Features

- **Complete API Service Layer** - Type-safe API calls with automatic error handling
- **Multi-Environment Support** - Development, test, and production configurations
- **Authentication Management** - JWT token handling with automatic refresh
- **React Hooks Integration** - Custom hooks for loading states and error handling
- **File Upload Support** - Built-in file upload with validation
- **Caching System** - Response caching with TTL support
- **Environment Validation** - Automatic validation of configuration

## 🏃‍♂️ Quick Start

### 1. Install Dependencies
```powershell
npm install
```

### 2. Check Environment
```powershell
# Check your environment is configured correctly
npm run env:check
```

### 3. Start Development Server
```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📋 Available Scripts

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Management
- `npm run env:check` - Check current environment configuration

## 📁 Project Structure

```
lime-web-admin/
├── src/
│   ├── app/                 # Next.js app directory
│   └── services/            # API service layer
│       ├── api/             # Core API service
│       ├── auth/            # Authentication service
│       ├── users/           # User management service
│       ├── hooks/           # React hooks for API calls
│       ├── utils/           # Utility functions
│       └── index.ts         # Main services export
├── docs/
│   ├── examples/            # Usage examples and demo components
│   └── *.md                 # Documentation
└── README.md
```

## 🔧 API Service Usage

### Basic API Calls
```tsx
import { apiService } from '@/services/api';

// Simple GET request
const users = await apiService.get('/users');

// POST with data
const newUser = await apiService.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Using React Hooks
```tsx
import { useQuery, useMutation } from '@/services/hooks/useApi';
import { UserService } from '@/services/users/userService';

function UserComponent() {
  const { data, loading, error } = useQuery(
    () => UserService.getUsers(),
    { immediate: true }
  );
  
  const { execute: createUser } = useMutation(
    (userData) => UserService.createUser(userData)
  );
  
  // Component logic...
}
```

### Authentication
```tsx
import { AuthService } from '@/services/auth/authService';

// Login (tokens are automatically stored)
await AuthService.login({
  email: 'user@example.com',
  password: 'password123'
});

// All subsequent API calls include auth headers automatically
const profile = await apiService.get('/profile');
```

## 🌍 Environment Configuration

The application supports multiple environments with different configurations:

- **Development** (`local`) - Local development with debug features
- **Test** (`test`) - Staging environment for testing
- **Production** (`prod`) - Live production environment

Each environment has its own API endpoints, timeouts, feature flags, and security settings.

## 📚 Documentation

- [📖 Quick Start Guide](./docs/quick-start.md) - Get up and running quickly
- [🔧 Environment Setup Guide](./docs/environment-setup.md) - Detailed environment configuration
- [🚀 Deployment Guide](./docs/deployment.md) - GitHub Actions deployment setup
- [🛠️ API Service Documentation](./src/services/README.md) - Complete API service guide
- [💡 Usage Examples](./docs/examples/) - Real-world usage examples

## 🚀 Deployment

### Vercel (Recommended)
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_API_BASE_URL production
```

### Docker
```powershell
# Build and run with Docker
docker build -t lime-web-admin .
docker run --env-file .env.production -p 3000:3000 lime-web-admin
```

## 🔒 Security

- All sensitive environment variables are validated
- JWT tokens are automatically managed and refreshed
- Production deployments require secure secrets
- Environment validation prevents common misconfigurations

## 📞 Support

- Check the [Quick Start Guide](./docs/quick-start.md) for common issues
- Review [Environment Setup](./docs/environment-setup.md) for configuration problems
- Check your setup with `npm run env:check`
- See [Deployment Guide](./docs/deployment.md) for CI/CD setup

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Check your environment (`npm run env:check`)
4. Make your changes
5. Test your changes (`npm run lint && npm run build`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 License

This project is private and proprietary.
