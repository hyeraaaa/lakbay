import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useJWT } from '@/contexts/JWTContext';
import { User } from '@/lib/jwt';
import { authService, LoginCredentials} from '@/services/authServices';

export const useAuth = () => {
  const { login, logout, user, isAuthenticated, isLoading } = useJWT();
  const [authError, setAuthError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    setIsProcessing(true);
    setAuthError('');

    try {
      const { ok, data } = await authService.login(credentials);

      if (!ok) throw new Error(data.message || 'Login failed');

      login(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user
      );

      redirectBasedOnUserType(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [login]);

  const handleLogout = useCallback(async () => {
    setIsProcessing(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    } finally {
      setIsProcessing(false);
    }
  }, [logout, router]);

  const handleGoogleLogin = useCallback(async (googleToken: string, userInfo: any) => {
    setIsProcessing(true);
    setAuthError('');

    try {
      const { ok, data } = await authService.googleLogin(googleToken, userInfo);

      if (!ok) throw new Error(data.message || 'Google authentication failed');

      login(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user
      );

      redirectBasedOnUserType(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [login]);

  const redirectBasedOnUserType = useCallback((userData: User) => {
    switch (userData.user_type) {
      case 'admin':
        router.replace('/admin');
        break;
      case 'owner':
        router.replace('/owner');
        break;
      case 'customer':
      default:
        router.replace('/');
        break;
    }
  }, [router]);

  const clearError = useCallback(() => setAuthError(''), []);

  return {
    user,
    isAuthenticated,
    isLoading,
    isProcessing,
    authError,
    login: handleLogin,
    logout: handleLogout,
    googleLogin: handleGoogleLogin,
    clearError,
    redirectBasedOnUserType,
  };
};
