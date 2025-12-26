import apiClient from '../lib/apiClient';

export interface Notification {
  id: number;
  user_id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificationList {
  items: Notification[];
  total: number;
  unread_count: number;
}

export const notificationService = {
  async getNotifications(
    skip: number = 0,
    limit: number = 50,
    unread_only: boolean = false
  ): Promise<NotificationList> {
    const { data } = await apiClient.get('/api/v1/notifications', {
      params: { skip, limit, unread_only },
    });
    return data;
  },

  async markAsRead(notificationId: number): Promise<Notification> {
    const { data } = await apiClient.put(`/api/v1/notifications/${notificationId}/read`);
    return data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/api/v1/notifications/read-all');
  },

  async deleteNotification(notificationId: number): Promise<void> {
    await apiClient.delete(`/api/v1/notifications/${notificationId}`);
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get('/api/v1/notifications/unread-count');
    return data.unread_count;
  },
};
