// Example React components showing how to use the API services
'use client';

import React, { useState, useEffect } from 'react';
import { UserService, type User } from '@/services/users/userService';
import { AuthService } from '@/services/auth/authService';
import { useApi, useMutation, useQuery } from '@/services/hooks/useApi';
import { handleApiError } from '@/services/utils/apiHelpers';

// Example: Users List Component
export const UsersListExample: React.FC = () => {
  // Using the custom hook for fetching users
  const {
    data: usersData,
    loading,
    error,
    refetch,
  } = useQuery(
    () => UserService.getUsers({ page: 1, limit: 10 }),
    {
      immediate: true, // Fetch on component mount
      onError: (error) => {
        console.error('Failed to fetch users:', handleApiError(error));
      },
    }
  );

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {handleApiError(error)}
        <button 
          onClick={() => refetch()} 
          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Users ({usersData?.total || 0})</h2>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid gap-4">
        {usersData?.users.map((user) => (
          <div key={user.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <span className="inline-block px-2 py-1 text-xs bg-gray-200 rounded">
              {user.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example: Create User Form Component
export const CreateUserExample: React.FC = () => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user' | 'moderator';
  }>({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  // Using mutation hook for creating user
  const {
    execute: createUser,
    loading: creating,
    error: createError,
    success,
  } = useMutation(
    (userData: typeof formData) => UserService.createUser(userData),
    {
      onSuccess: (newUser) => {
        console.log('User created successfully:', newUser);
        setFormData({ name: '', email: '', password: '', role: 'user' });
      },
      onError: (error) => {
        console.error('Failed to create user:', handleApiError(error));
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(formData);
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create New User</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              role: e.target.value as 'admin' | 'user' | 'moderator' 
            }))}
            className="w-full p-2 border rounded"
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {createError && (
          <div className="text-red-600 text-sm">
            {handleApiError(createError)}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm">
            User created successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={creating}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

// Example: Authentication Component
export const LoginExample: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  // Using the API service directly
  const [loginState, setLoginState] = useState({
    loading: false,
    error: null as string | null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Initialize auth state
    AuthService.initializeAuth();
    setLoginState(prev => ({
      ...prev,
      isAuthenticated: AuthService.isAuthenticated(),
    }));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        setLoginState(prev => ({
          ...prev,
          loading: false,
          isAuthenticated: true,
        }));
        setCredentials({ username: '', password: '', rememberMe: false });
      }
    } catch (error: any) {
      setLoginState(prev => ({
        ...prev,
        loading: false,
        error: handleApiError(error),
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setLoginState(prev => ({
        ...prev,
        isAuthenticated: false,
      }));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loginState.isAuthenticated) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Welcome!</h2>
        <p className="mb-4">You are successfully logged in.</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={credentials.username}
            onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={credentials.rememberMe}
            onChange={(e) => setCredentials(prev => ({ ...prev, rememberMe: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="rememberMe" className="text-sm">Remember me</label>
        </div>

        {loginState.error && (
          <div className="text-red-600 text-sm">
            {loginState.error}
          </div>
        )}

        <button
          type="submit"
          disabled={loginState.loading}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loginState.loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};