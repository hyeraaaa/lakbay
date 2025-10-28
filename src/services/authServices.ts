// services/authService.ts
import { apiRequest } from '@/lib/jwt';
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
  deviceToken?: string;
}

export interface User {
  id: string;
  email: string;
  user_type: string;
  is_verified: boolean;
  is_email_verified: boolean;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  two_fa_enabled?: boolean;
  created_at?: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
}

export interface LoginResponse {
  accessToken?: string;
  user?: User;
  message?: string;
  isNewUser?: boolean;
  requires2FA?: boolean;
  requiresReactivation?: boolean;
  flow?: 'self' | 'admin_approval';
  reactivationToken?: string;
  emailMasked?: string;
  next?: {
    submit_to: string;
    body: Record<string, string>;
    expires_in_minutes: number;
  };
}

export interface ResetPasswordData {
  newPassword: string;
}

export interface VerifyEmailData {
  email: string;
}

export interface ResetPasswordResponse {
  message?: string;
  success?: boolean;
}

export interface EmailVerificationResponse {
  message?: string;
  success?: boolean;
  verified?: boolean;
}

export const authService = {
  register: async (data: RegistrationData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return { 
      ok: response.ok, 
      data: result,
      message: result.message || (response.ok ? undefined : 'Registration failed')
    };
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    return { 
      ok: response.ok, 
      data: result,
      message: result.message || (response.ok ? undefined : 'Failed to send reset email')
    };
  },

  login: async (credentials: LoginCredentials): Promise<{ ok: boolean; data: LoginResponse; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    const result: LoginResponse = await response.json();
    return { 
      ok: response.ok, 
      data: result,
      message: result.message || (response.ok ? undefined : 'Login failed')
    };
  },

  googleLogin: async (googleToken: string, userInfo: GoogleUserInfo, deviceToken?: string): Promise<{ ok: boolean; data: LoginResponse; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleToken, userInfo, deviceToken }),
      credentials: 'include',
    });
    const result: LoginResponse = await response.json();
    return { 
      ok: response.ok, 
      data: result,
      message: result.message || (response.ok ? undefined : 'Google authentication failed')
    };
  },

  resetPassword: async (token: string, data: ResetPasswordData): Promise<{ ok: boolean; data: ResetPasswordResponse; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    return { 
      ok: response.ok, 
      data: result,
      message: result.message || (response.ok ? undefined : 'Password reset failed')
    };
  },

  verifyEmail: async (data: VerifyEmailData): Promise<{ ok: boolean; data: EmailVerificationResponse; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    return { 
      ok: response.ok, 
      data: result,
      message: result.message || (response.ok ? undefined : 'Failed to send verification email')
    };
  },

  updateEmail: async (userId: string, data: { email: string }) => {
    const response = await apiRequest(`${API_BASE_URL}/api/users/${userId}/email`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    const result = await response.json().catch(() => ({}))
    return { 
      ok: response.ok, 
      data: result,
      message: result.message || (response.ok ? undefined : 'Failed to update email')
    }
  },

  updatePassword: async (userId: string, data: { current_password: string; new_password: string }) => {
    const response = await apiRequest(`${API_BASE_URL}/api/users/${userId}/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    const result = await response.json().catch(() => ({}))
    return { 
      ok: response.ok, 
      data: result,
      message: result.message || (response.ok ? undefined : 'Failed to update password')
    }
  },

  emailVerification: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-email/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json().catch(() => ({}));
    return { 
      ok: response.ok, 
      data,
      message: data.message || (response.ok ? undefined : 'Email verification failed')
    };
  },

  toggle2FA: async (enabled: boolean) => {
    const response = await apiRequest(`${API_BASE_URL}/api/auth/2fa/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });

    const data = await response.json().catch(() => ({}));
    return { 
      ok: response.ok, 
      data,
      message: data.message || (response.ok ? undefined : 'Failed to toggle 2FA')
    };
  },

  verify2FA: async (email: string, code: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json().catch(() => ({}));
    return { 
      ok: response.ok, 
      data,
      message: data.message || (response.ok ? undefined : 'Failed to verify 2FA code')
    };
  },

  resend2FA: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/2fa/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));
    return { 
      ok: response.ok, 
      data,
      message: data.message || (response.ok ? undefined : 'Failed to resend 2FA code')
    };
  },

  deactivateAccount: async (userId: string, password: string, reason?: string) => {
    const response = await apiRequest(`${API_BASE_URL}/api/users/${userId}/deactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, reason }),
    });

    const data = await response.json().catch(() => ({}));
    return { 
      ok: response.ok, 
      data,
      message: data.message || (response.ok ? undefined : 'Failed to deactivate account')
    };
  },

  completeReactivation: async (userId: string, verificationCode: string) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/reactivate/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verification_code: verificationCode }),
    });

    const data = await response.json().catch(() => ({}));
    return { 
      ok: response.ok, 
      data,
      message: data.message || (response.ok ? undefined : 'Failed to reactivate account')
    };
  },

  resendReactivationCode: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/reactivate/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json().catch(() => ({}));
    return { 
      ok: response.ok, 
      data,
      message: data.message || (response.ok ? undefined : 'Failed to resend reactivation code')
    };
  },
};
