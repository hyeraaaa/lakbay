import { apiRequest } from '../lib/jwt';

export interface Notification {
  notification_id: number;
  title: string;
  message: string;
  type: 'system' | 'booking' | 'payment' | 'review';
  is_read: boolean;
  related_id?: number;
  created_at: string;
  read_at?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unread_count: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
}

class NotificationService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`;

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await apiRequest(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  }

  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }): Promise<NotificationResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.is_read !== undefined) searchParams.append('is_read', params.is_read.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    return this.makeRequest<NotificationResponse>(url);
  }

  async getNotificationById(notificationId: number): Promise<Notification> {
    return this.makeRequest<Notification>(`${this.baseUrl}/${notificationId}`);
  }

  async markAsRead(notificationId: number): Promise<{ message: string; notification: Notification }> {
    return this.makeRequest<{ message: string; notification: Notification }>(
      `${this.baseUrl}/${notificationId}/read`,
      { method: 'PATCH' }
    );
  }

  async markAllAsRead(): Promise<{ message: string; updated_count: number }> {
    return this.makeRequest<{ message: string; updated_count: number }>(
      `${this.baseUrl}/read-all`,
      { method: 'PATCH' }
    );
  }

  async deleteNotification(notificationId: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      `${this.baseUrl}/${notificationId}`,
      { method: 'DELETE' }
    );
  }

  async getNotificationStats(): Promise<NotificationStats> {
    return this.makeRequest<NotificationStats>(`${this.baseUrl}/stats`);
  }
}

export const notificationService = new NotificationService();
