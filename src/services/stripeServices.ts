// services/stripeServices.ts
import { apiRequest } from '@/lib/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// TypeScript interfaces for Stripe Connect
export interface CreateConnectAccountData {
  // No additional data needed - user info comes from JWT token
  [key: string]: never;
}

export interface CreateConnectAccountResponse {
  message: string;
  accountId: string;
  nextStep: string;
}

export interface CreateAccountLinkData {
  refreshUrl: string;
  returnUrl: string;
}

export interface CreateAccountLinkResponse {
  message: string;
  onboardingUrl: string;
  expiresAt: number;
}

export interface AccountStatusResponse {
  message: string;
  accountId: string;
  isVerified: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: Record<string, unknown>;
}

export interface ProcessPayoutResponse {
  message: string;
  transferId: string;
  ownerAmount: number;
  ownerAmountTransferred: number;
  transferCurrency: string;
  platformFee: number;
  totalAmount: number;
  currencyConversion?: {
    from: string;
    to: string;
    rate: number;
  } | null;
}

export const stripeService = {
  /**
   * Create a Stripe Connect account for the current user (owner)
   * @returns Promise with account creation result
   */
  createConnectAccount: async (): Promise<{ ok: boolean; data: CreateConnectAccountResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/stripe-connect/account/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to create Stripe Connect account')
      };
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      return {
        ok: false,
        data: {} as CreateConnectAccountResponse,
        message: 'Failed to create Stripe Connect account'
      };
    }
  },

  /**
   * Create an account link for onboarding
   * @param data - Contains refreshUrl and returnUrl
   * @returns Promise with onboarding link
   */
  createAccountLink: async (data: CreateAccountLinkData): Promise<{ ok: boolean; data: CreateAccountLinkResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/stripe-connect/account/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to create account link')
      };
    } catch (error) {
      console.error('Error creating account link:', error);
      return {
        ok: false,
        data: {} as CreateAccountLinkResponse,
        message: 'Failed to create account link'
      };
    }
  },

  /**
   * Check the status of the current user's Stripe Connect account
   * @returns Promise with account status
   */
  checkAccountStatus: async (): Promise<{ ok: boolean; data: AccountStatusResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/stripe-connect/account/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to get account status')
      };
    } catch (error) {
      console.error('Error checking account status:', error);
      return {
        ok: false,
        data: {} as AccountStatusResponse,
        message: 'Failed to get account status'
      };
    }
  },

  /**
   * Process owner payout for a completed booking
   * @param bookingId - The booking ID to process payout for
   * @returns Promise with payout result
   */
  processOwnerPayout: async (bookingId: number): Promise<{ ok: boolean; data: ProcessPayoutResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/stripe-connect/payout/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to process payout')
      };
    } catch (error) {
      console.error('Error processing payout:', error);
      return {
        ok: false,
        data: {} as ProcessPayoutResponse,
        message: 'Failed to process payout'
      };
    }
  },

  /**
   * Complete Stripe Connect onboarding flow
   * This is a convenience method that combines account creation and link generation
   * @param refreshUrl - URL to redirect to if link expires
   * @param returnUrl - URL to redirect to after onboarding
   * @returns Promise with onboarding URL
   */
  startOnboarding: async (refreshUrl: string, returnUrl: string): Promise<{ ok: boolean; data: CreateAccountLinkResponse; message?: string }> => {
    try {
      // First, try to create account link (in case account already exists)
      const linkResult = await stripeService.createAccountLink({ refreshUrl, returnUrl });
      
      if (linkResult.ok) {
        return linkResult;
      }

      // If account doesn't exist, create it first
      const accountResult = await stripeService.createConnectAccount();
      if (!accountResult.ok) {
        return {
          ok: false,
          data: {} as CreateAccountLinkResponse,
          message: accountResult.message || 'Failed to create account'
        };
      }

      // Now create the account link
      return await stripeService.createAccountLink({ refreshUrl, returnUrl });
    } catch (error) {
      console.error('Error starting onboarding:', error);
      return {
        ok: false,
        data: {} as CreateAccountLinkResponse,
        message: 'Failed to start onboarding process'
      };
    }
  },

  /**
   * Check if user's Stripe account is ready for payouts
   * @returns Promise with boolean indicating if account is ready
   */
  isAccountReadyForPayouts: async (): Promise<{ ok: boolean; isReady: boolean; message?: string }> => {
    try {
      const statusResult = await stripeService.checkAccountStatus();
      
      if (!statusResult.ok) {
        return {
          ok: false,
          isReady: false,
          message: statusResult.message
        };
      }

      const isReady = statusResult.data.isVerified && statusResult.data.payoutsEnabled;
      
      return {
        ok: true,
        isReady,
        message: isReady ? 'Account is ready for payouts' : 'Account needs to complete verification'
      };
    } catch (error) {
      console.error('Error checking payout readiness:', error);
      return {
        ok: false,
        isReady: false,
        message: 'Failed to check payout readiness'
      };
    }
  }
};
