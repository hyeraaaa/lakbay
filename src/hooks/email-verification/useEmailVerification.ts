import { useEffect, useState } from 'react';
import { authService } from '@/services/authServices';

export const useVerifyEmail = (token: string | null) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing. Please check your email and try again.');
      return;
    }

    const verify = async () => {
      try {
        const { ok, data } = await authService.emailVerification(token);
        if (ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'Email verification failed. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Network error. Please check your connection and try again.');
      }
    };

    verify();
  }, [token]);

  return { status, errorMessage };
};
