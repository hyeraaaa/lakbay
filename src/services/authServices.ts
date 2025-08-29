// services/authService.ts
import { getAccessToken } from '@/lib/jwt';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface RegistrationData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
  message?: string;
}

export interface ResetPasswordData {
  newPassword: string;
}

export interface VerifyEmailData {
  email: string;
}

export const authService = {
  register: async (data: RegistrationData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return { ok: response.ok, data: result };
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, data: result };
  },

  login: async (credentials: LoginCredentials): Promise<{ ok: boolean; data: LoginResponse }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const result: LoginResponse = await response.json();
    return { ok: response.ok, data: result };
  },

  googleLogin: async (googleToken: string, userInfo: any): Promise<{ ok: boolean; data: LoginResponse }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleToken, userInfo }),
    });
    const result: LoginResponse = await response.json();
    return { ok: response.ok, data: result };
  },

  resetPassword: async (token: string, data: ResetPasswordData): Promise<{ ok: boolean; data: any }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, data: result };
  },

  verifyEmail: async (data: VerifyEmailData): Promise<{ ok: boolean; data: any }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, data: result };
  },

  updateEmail: async (userId: string, data: { email: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/email`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      },
      body: JSON.stringify(data),
    })
    const result = await response.json().catch(() => ({}))
    return { ok: response.ok, data: result }
  },

  updatePassword: async (userId: string, data: { current_password: string; new_password: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      },
      body: JSON.stringify(data),
    })
    const result = await response.json().catch(() => ({}))
    return { ok: response.ok, data: result }
  },

  emailVerification: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-email/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
  },
};
