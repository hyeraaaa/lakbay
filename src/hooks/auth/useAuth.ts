import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useJWT } from '@/contexts/JWTContext';
import { User } from '@/lib/jwt';
import { authService, LoginCredentials, LoginResponse, GoogleUserInfo } from '@/services/authServices';

export const useAuth = () => {
  const { login, logout, user, isAuthenticated, isLoading, isLoggingOut } = useJWT();
  const [authError, setAuthError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Device token generation and validation
  const generateDeviceToken = (email: string) => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const deviceInfo = navigator.userAgent + navigator.language
    const token = btoa(`${email}:${timestamp}:${randomString}:${deviceInfo}`)
    return token
  }

  const checkDeviceRemembered = (email: string) => {
    if (typeof window === 'undefined') return false
    
    const deviceToken = localStorage.getItem(`device_token_${email}`)
    if (!deviceToken) return false

    try {
      const decoded = atob(deviceToken)
      const [, timestamp] = decoded.split(':')
      const tokenAge = Date.now() - parseInt(timestamp)
      const sevenDays = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      
      return tokenAge < sevenDays
    } catch {
      return false
    }
  }

  const saveDeviceToken = useCallback((email: string) => {
    if (typeof window === 'undefined') return
    
    const token = generateDeviceToken(email)
    localStorage.setItem(`device_token_${email}`, token)
  }, [])

  const redirectBasedOnUserType = useCallback((userData: User) => {
    // Use router.push instead of replace for smoother navigation
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

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    setIsProcessing(true);
    setAuthError('');

    try {
      // Check if device is remembered and get device token
      let deviceToken = null;
      if (typeof window !== 'undefined') {
        const isDeviceRemembered = checkDeviceRemembered(credentials.email);
        if (isDeviceRemembered) {
          deviceToken = localStorage.getItem(`device_token_${credentials.email}`);
        }
      }

      // Include device token in login request
      const loginCredentials = {
        ...credentials,
        deviceToken: deviceToken || undefined
      };

      const { ok, data, message } = await authService.login(loginCredentials);

      if (!ok) throw new Error(message || data.message || 'Login failed');

      // Check if 2FA is required
      if (data.requires2FA) {
        // Store email for 2FA verification and redirect to verify-login page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('2fa_email', credentials.email);
        }
        router.push('/verify-login');
        return { success: true, requires2FA: true, email: credentials.email };
      }

      login(
        { accessToken: data.accessToken },
        data.user
      );

      redirectBasedOnUserType(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';

      // If email is not verified, automatically trigger resend verification email
      if (errorMessage.includes('Please verify your email before logging in')) {
        try {
          // Fire-and-forget; backend responds uniformly for security
          await authService.verifyEmail({ email: credentials.email });
        } catch (_) {
          // Intentionally swallow resend errors to avoid masking original auth error
        }
      }

      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [login, router, redirectBasedOnUserType]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      // No need to manually redirect - logout() in JWTContext handles this
    } catch (error) {
      console.error('Logout error:', error);
      // No need to manually redirect - logout() in JWTContext handles this
    }
  }, [logout]);

  const handleGoogleLogin = useCallback(async (googleToken: string, userInfo: GoogleUserInfo) => {
    setIsProcessing(true);
    setAuthError('');

    try {
      // Check if device is remembered and get device token
      let deviceToken = null;
      if (typeof window !== 'undefined') {
        const isDeviceRemembered = checkDeviceRemembered(userInfo.email);
        if (isDeviceRemembered) {
          deviceToken = localStorage.getItem(`device_token_${userInfo.email}`);
        }
      }

      const { ok, data, message }: { ok: boolean; data: LoginResponse; message?: string } = await authService.googleLogin(googleToken, userInfo, deviceToken || undefined);

      if (!ok) throw new Error(message || data.message || 'Google authentication failed');

      // Check if 2FA is required
      if (data.requires2FA) {
        // Store email for 2FA verification and redirect to verify-login page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('2fa_email', data.user.email);
        }
        router.push('/verify-login');
        return { success: true, requires2FA: true, email: data.user.email };
      }

      login(
        { accessToken: data.accessToken },
        data.user
      );

      // Check if this was a new user (auto-registered)
      const isNewUser = data.isNewUser || false;
      if (isNewUser) {
        console.log('New user auto-registered via Google:', data.user.email);
        // You could show a welcome message here if needed
      }

      redirectBasedOnUserType(data.user);
      return { success: true, user: data.user, isNewUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [login, router, redirectBasedOnUserType]);


  const handle2FAVerification = useCallback(async (email: string, code: string, rememberDevice?: boolean) => {
    setIsProcessing(true);
    setAuthError('');

    try {
      const { ok, data, message } = await authService.verify2FA(email, code);

      if (!ok) throw new Error(message || data.message || '2FA verification failed');

      login(
        { accessToken: data.accessToken },
        data.user
      );

      // If user wants to remember device, save the token
      if (rememberDevice) {
        saveDeviceToken(email);
      }

      // Clear the stored email
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('2fa_email');
      }

      redirectBasedOnUserType(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '2FA verification failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [login, redirectBasedOnUserType, saveDeviceToken]);

  const handleResend2FA = useCallback(async (email: string) => {
    setAuthError('');

    try {
      const { ok, data, message } = await authService.resend2FA(email);
      
      if (!ok) {
        throw new Error(message || 'Failed to resend 2FA code');
      }

      return { success: true, message: data.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend 2FA code';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => setAuthError(''), []);

  return {
    user,
    isAuthenticated,
    isLoading,
    isProcessing,
    isLoggingOut,
    authError,
    login: handleLogin,
    logout: handleLogout,
    googleLogin: handleGoogleLogin,
    verify2FA: handle2FAVerification,
    resend2FA: handleResend2FA,
    clearError,
    redirectBasedOnUserType,
    checkDeviceRemembered,
    saveDeviceToken,
  };
};
