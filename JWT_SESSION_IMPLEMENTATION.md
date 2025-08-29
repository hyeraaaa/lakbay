# JWT Session Implementation Guide

This document explains how to use the JWT session management system implemented in the Lakbay client application.

## Overview

The JWT session system provides:
- **Automatic token management** - Access tokens (15min) and refresh tokens (7 days)
- **Automatic token refresh** - Tokens are refreshed before they expire
- **Route protection** - Protect routes based on authentication and user roles
- **Context-based state management** - Global authentication state
- **Secure API requests** - Automatic token inclusion and refresh handling
- **Auth page protection** - Authenticated users are automatically redirected from auth pages

## Architecture

```
JWTContext (Provider)
├── Authentication State
├── Token Management
├── Auto-refresh Logic
└── User Information

ProtectedRoute Components
├── Route Protection
├── Role-based Access
└── Loading States

RedirectIfAuthenticated
├── Prevents authenticated users from accessing auth pages
└── Automatic redirect to appropriate dashboard

JWT Utilities
├── Token Validation
├── API Request Wrapper
└── Storage Management
```

## Key Components

### 1. JWT Context (`/src/contexts/JWTContext.tsx`)

The main authentication context that manages:
- User authentication state
- Token refresh logic
- Login/logout functions

**Usage:**
```tsx
import { useJWT } from '@/contexts/JWTContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useJWT();
  
  // Use authentication state and functions
}
```

### 2. Protected Route Components (`/src/components/auth/ProtectedRoute.tsx`)

Components that protect routes based on authentication and user roles:

**Basic Protection:**
```tsx
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';

<AuthenticatedRoute>
  <MyProtectedComponent />
</AuthenticatedRoute>
```

**Role-based Protection:**
```tsx
import { AdminRoute, OwnerRoute, UserRoute } from '@/components/auth/ProtectedRoute';

<AdminRoute>
  <AdminOnlyComponent />
</AdminRoute>

<OwnerRoute>
  <OwnerOnlyComponent />
</OwnerRoute>

<UserRoute>
  <UserOnlyComponent />
</UserRoute>
```

### 3. Redirect If Authenticated (`/src/components/auth/RedirectIfAuthenticated.tsx`)

Component that prevents authenticated users from accessing authentication pages:

**Usage:**
```tsx
import { RedirectIfAuthenticated } from '@/components/auth/RedirectIfAuthenticated';

function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <LoginForm />
    </RedirectIfAuthenticated>
  );
}
```

**What it does:**
- Checks if user is already authenticated
- If authenticated, automatically redirects to appropriate dashboard
- If not authenticated, shows the auth form
- Prevents security issues like authenticated users seeing login forms

### 4. Authentication Hook (`/src/hooks/auth/useAuth.ts`)

Custom hook for authentication operations:

**Usage:**
```tsx
import { useAuth } from '@/hooks/auth/useAuth';

function LoginForm() {
  const { login, logout, user, isAuthenticated, authError } = useAuth();
  
  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      // Redirect handled automatically
    }
  };
}
```

### 5. API Hook (`/src/hooks/auth/useApi.ts`)

Hook for making authenticated API requests:

**Usage:**
```tsx
import { useApi } from '@/hooks/auth/useApi';

function MyComponent() {
  const { get, post, put, del } = useApi();
  
  const fetchData = async () => {
    const response = await get('/api/users/profile');
    const data = await response.json();
  };
  
  const updateData = async (data) => {
    const response = await put('/api/users/profile', data);
  };
}
```

## Setup Instructions

### 1. Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. App Layout

The JWT provider is already set up in the root layout (`/src/app/layout.tsx`):

```tsx
import { ClientLayout } from "@/components/layout/ClientLayout";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <body>
          <ClientLayout>
            {children}
          </ClientLayout>
        </body>
      </GoogleOAuthProvider>
    </html>
  );
}
```

### 3. Using Protected Routes

**Basic Route Protection:**
```tsx
// /src/app/dashboard/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected Dashboard Content</div>
    </ProtectedRoute>
  );
}
```

**Role-based Route Protection:**
```tsx
// /src/app/dashboard/admin/page.tsx
import { AdminRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <AdminRoute>
      <div>Admin Only Content</div>
    </AdminRoute>
  );
}
```

### 4. Protecting Authentication Pages

**Prevent authenticated users from accessing auth pages:**
```tsx
// /src/app/(auth)/login/page.tsx
import { RedirectIfAuthenticated } from '@/components/auth/RedirectIfAuthenticated';

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <LoginForm />
    </RedirectIfAuthenticated>
  );
}
```

**This automatically:**
- Redirects authenticated users to their dashboard
- Shows login form only to unauthenticated users
- Prevents security vulnerabilities

## Authentication Flow

### 1. Login Process

```tsx
import { useAuth } from '@/hooks/auth/useAuth';

function LoginForm() {
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      // User is automatically redirected based on user type
      console.log('Login successful:', result.user);
    }
  };
}
```

### 2. Token Refresh

The system automatically:
- Checks token expiry every minute
- Refreshes tokens 5 minutes before expiration
- Handles failed refresh by logging out user

### 3. Logout Process

```tsx
import { useAuth } from '@/hooks/auth/useAuth';

function LogoutButton() {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    // User is automatically redirected to login page
  };
  
  return <button onClick={logout}>Logout</button>;
}
```

### 4. Auth Page Protection

When an authenticated user tries to access auth pages:
- **Login page** → Redirected to appropriate dashboard
- **Register page** → Redirected to appropriate dashboard  
- **Forgot password** → Redirected to appropriate dashboard
- **Reset password** → Redirected to appropriate dashboard

## API Integration

### Making Authenticated Requests

```tsx
import { useApi } from '@/hooks/auth/useApi';

function UserProfile() {
  const { get, put } = useApi();
  
  const fetchProfile = async () => {
    try {
      const response = await get('/api/users/profile');
      const profile = await response.json();
      // Handle profile data
    } catch (error) {
      // Handle errors (authentication errors are handled automatically)
    }
  };
  
  const updateProfile = async (data) => {
    try {
      const response = await put('/api/users/profile', data);
      // Handle success
    } catch (error) {
      // Handle errors
    }
  };
}
```

### Automatic Token Handling

The `useApi` hook automatically:
- Includes the current access token in requests
- Refreshes tokens when needed
- Handles 401 responses by logging out the user
- Redirects to login page on authentication failures

## User Types and Routing

The system supports three user types:

1. **admin** - Redirects to `/dashboard/admin`
2. **owner** - Redirects to `/dashboard/owner`
3. **customer** - Redirects to `/` (landing page)

### Custom Redirects

```tsx
<ProtectedRoute redirectTo="/custom-login">
  <MyComponent />
</ProtectedRoute>

<RedirectIfAuthenticated redirectTo="/custom-dashboard">
  <AuthForm />
</RedirectIfAuthenticated>
```

## Error Handling

### Authentication Errors

- **Invalid tokens** - Automatically logged out and redirected
- **Expired tokens** - Automatically refreshed
- **Network errors** - Handled gracefully with user feedback

### Custom Error Handling

```tsx
import { useAuth } from '@/hooks/auth/useAuth';

function MyComponent() {
  const { authError, clearError } = useAuth();
  
  useEffect(() => {
    if (authError) {
      // Show error message
      console.error('Auth error:', authError);
      // Clear error after showing
      clearError();
    }
  }, [authError, clearError]);
}
```

## Security Features

1. **Token Storage** - Tokens stored in localStorage (consider httpOnly cookies for production)
2. **Automatic Refresh** - Prevents session expiration
3. **Secure Logout** - Invalidates refresh tokens on server
4. **Route Protection** - Prevents unauthorized access
5. **Token Validation** - JWT signature and expiry validation
6. **Auth Page Protection** - Prevents authenticated users from accessing auth forms
7. **Automatic Redirects** - Users are sent to appropriate dashboards based on role

## Best Practices

1. **Always use ProtectedRoute** for authenticated pages
2. **Use RedirectIfAuthenticated** for auth pages (login, register, etc.)
3. **Use useApi hook** for authenticated API calls
4. **Handle loading states** with `isLoading` from context
5. **Clear errors** after displaying them to users
6. **Test role-based access** with different user types
7. **Test auth page protection** by logging in and trying to access login page

## Troubleshooting

### Common Issues

1. **Tokens not refreshing** - Check server refresh endpoint
2. **Route protection not working** - Ensure JWTProvider wraps the app
3. **API calls failing** - Verify environment variables
4. **Google OAuth issues** - Check Google client ID configuration
5. **Auth pages still showing for authenticated users** - Ensure RedirectIfAuthenticated is used

### Debug Mode

Enable debug logging by checking browser console for:
- Token refresh attempts
- Authentication state changes
- Route protection decisions
- Auth page redirects

## Migration from Old System

If you're migrating from the old localStorage-based system:

1. **Remove old token storage** - The new system handles this
2. **Update API calls** - Use `useApi` hook instead of manual fetch
3. **Wrap components** - Use `ProtectedRoute` components
4. **Update login forms** - Use `useAuth` hook
5. **Protect auth pages** - Wrap with `RedirectIfAuthenticated`

The new system is backward compatible and will work with your existing Express server without any changes. 