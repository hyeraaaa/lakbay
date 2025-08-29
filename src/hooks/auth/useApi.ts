import { useCallback } from 'react';
import { useJWT } from '@/contexts/JWTContext';
import { apiRequest } from '@/lib/jwt';

export const useApi = () => {
  const { logout } = useJWT();

  const get = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const response = await apiRequest(url, {
        ...options,
        method: 'GET',
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        await logout();
      }
      throw error;
    }
  }, [logout]);

  const post = useCallback(async (url: string, data: any, options: RequestInit = {}) => {
    try {
      const response = await apiRequest(url, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        await logout();
      }
      throw error;
    }
  }, [logout]);

  const put = useCallback(async (url: string, data: any, options: RequestInit = {}) => {
    try {
      const response = await apiRequest(url, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        await logout();
      }
      throw error;
    }
  }, [logout]);

  const del = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const response = await apiRequest(url, {
        ...options,
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        await logout();
      }
      throw error;
    }
  }, [logout]);

  const patch = useCallback(async (url: string, data: any, options: RequestInit = {}) => {
    try {
      const response = await apiRequest(url, {
        ...options,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        await logout();
      }
      throw error;
    }
  }, [logout]);

  return {
    get,
    post,
    put,
    del,
    patch,
  };
}; 