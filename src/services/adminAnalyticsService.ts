import { apiRequest } from "@/lib/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export type BookingAnalytics = {
  total: number;
  today: number;
  thisMonth: number;
  byStatus: Array<{ status: string; _count: { status: number } }>;
  mostBookedVehicles: Array<{ vehicle_id: number; _count: { vehicle_id: number } }>;
  bookingsPerCustomer: Array<{ user_id: number; _count: { user_id: number } }>;
  topOwners: Array<{ owner_id: number; count: number }>;
};

export type FinancialAnalytics = {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  totalAdminFees: number;
  revenueByOwner: Record<string, number>;
  // Optional detailed breakdown that some endpoints/versions may return
  revenueByOwnerDetailed?: Array<{
    owner_id: string | number;
    owner_name?: string;
    revenue: number | string;
  }>;
};

export const adminAnalyticsService = {
  async getBookingAnalytics(): Promise<BookingAnalytics> {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/analytics/bookings`, { method: "GET" });
    if (!res.ok) throw new Error(`Failed to fetch booking analytics: ${res.status}`);
    return res.json();
  },

  async getFinancialAnalytics(): Promise<FinancialAnalytics> {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/analytics/financial`, { method: "GET" });
    if (!res.ok) throw new Error(`Failed to fetch financial analytics: ${res.status}`);
    return res.json();
  },
};

export default adminAnalyticsService;


