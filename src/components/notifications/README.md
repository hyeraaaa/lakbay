# Notification System

A complete notification system with real-time updates, scrollable popover, and comprehensive API integration.

## Features

- 🔔 **Real-time Notifications** - WebSocket integration for instant updates
- 📱 **Scrollable Popover** - Clean, responsive notification interface
- 🎯 **Smart Filtering** - Filter by type (system, booking, payment, review) and read status
- ⚡ **Optimistic Updates** - Instant UI updates with proper error handling
- 🔄 **Auto-refresh** - Automatic data fetching and state management
- 📊 **Statistics** - Notification counts and type breakdowns
- 🎨 **TypeScript** - Full type safety and IntelliSense support

## Components

### NotificationPopover
Main notification component with popover interface.

```tsx
import { NotificationPopover } from '@/components/notifications';

// Basic usage
<NotificationPopover />

// Custom trigger
<NotificationPopover>
  <Button variant="outline">
    Custom Trigger
  </Button>
</NotificationPopover>
```

### NotificationItem
Individual notification display component.

```tsx
import { NotificationItem } from '@/components/notifications';

<NotificationItem
  notification={notification}
  onMarkAsRead={markAsRead}
  onDelete={deleteNotification}
/>
```

## Hooks

### useNotifications
Main hook for notification state management.

```tsx
import { useNotifications } from '@/hooks/notifications/useNotifications';

const {
  notifications,
  unreadCount,
  stats,
  loading,
  error,
  pagination,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  refreshNotifications,
  refreshStats
} = useNotifications({
  autoFetch: true,
  page: 1,
  limit: 20,
  type: 'booking', // optional filter
  is_read: false   // optional filter
});
```

## Services

### notificationService
API service for notification operations.

```tsx
import { notificationService } from '@/services/notificationService';

// Get notifications with pagination
const notifications = await notificationService.getNotifications({
  page: 1,
  limit: 20,
  type: 'booking',
  is_read: false
});

// Mark notification as read
await notificationService.markAsRead(notificationId);

// Mark all as read
await notificationService.markAllAsRead();

// Delete notification
await notificationService.deleteNotification(notificationId);

// Get statistics
const stats = await notificationService.getNotificationStats();
```

## API Endpoints

The notification system integrates with these backend endpoints:

- `GET /api/notifications` - Get paginated notifications
- `GET /api/notifications/stats` - Get notification statistics
- `GET /api/notifications/:id` - Get specific notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Real-time Updates

The system supports real-time updates via WebSocket:

- `new_notification` - New notification received
- `notification_read` - Notification marked as read
- `all_notifications_read` - All notifications marked as read
- `notification_count_update` - Unread count updated

## Usage Examples

### Basic Integration
```tsx
// In your navbar or header
import { NotificationPopover } from '@/components/notifications';

export function Navbar() {
  return (
    <header>
      <NotificationPopover />
    </header>
  );
}
```

### Custom Implementation
```tsx
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { NotificationItem } from '@/components/notifications';

export function CustomNotificationList() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification
  } = useNotifications();

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.notification_id}
          notification={notification}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      ))}
    </div>
  );
}
```

### With Filtering
```tsx
const { notifications, fetchNotifications } = useNotifications();

const handleFilterChange = (type: string) => {
  fetchNotifications({
    type: type === 'all' ? undefined : type,
    is_read: false
  });
};
```

## Styling

The components use Tailwind CSS and are fully customizable. Key classes:

- `.notification-item` - Individual notification styling
- `.notification-popover` - Popover container
- `.notification-badge` - Unread count badge
- `.notification-filter` - Filter controls

## Dependencies

- `date-fns` - Date formatting
- `lucide-react` - Icons
- `@/components/ui/*` - UI components (Button, Card, Badge, etc.)

## Error Handling

The system includes comprehensive error handling:

- API request failures are caught and logged
- User-friendly error messages
- Graceful fallbacks for failed operations
- Retry mechanisms for critical operations

## Performance

- Optimistic updates for better UX
- Pagination support for large datasets
- Efficient re-rendering with proper React patterns
- Lazy loading of notification data

