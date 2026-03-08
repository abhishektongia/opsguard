# Real-Time Features Guide

## Overview

OpsGuard uses **Socket.IO** for real-time bidirectional communication between clients and server. This enables instant updates for alerts, incidents, notifications, and team activities without requiring page refreshes.

## Architecture

### Socket.IO Server (`src/lib/socket/index.ts`)

The Socket.IO server provides:
- **Namespace-based broadcasting** to organization rooms
- **User-specific messaging** for personalized notifications
- **JWT authentication** for secure connections
- **Connection management** with automatic reconnection

### Key Features

1. **Organization Rooms**: All users in an org subscribe to `org:${orgId}` room
2. **User Rooms**: Individual users subscribe to `user:${userId}` room for private events
3. **Event Types**: Standardized event broadcasting for alerts, incidents, notifications, and timeline updates

## Real-Time Events

### Alert Events

#### `alert:created`
Broadcasted when a new alert is created to the organization.

```typescript
// Event data structure
{
  type: 'alert:created',
  alert: {
    id: string,
    title: string,
    description: string,
    severity: 'P1' | 'P2' | 'P3' | 'P4' | 'P5',
    status: 'OPEN' | 'ACK' | 'RESOLVED',
    source: string,
    createdAt: Date,
    ...
  },
  timestamp: Date
}
```

**Usage Example:**
```typescript
useAlertEvents(orgId, {
  onAlertCreated: (event) => {
    console.log(`New alert: ${event.alert.title} (${event.alert.severity})`);
    // Refresh alert list or show toast notification
  }
});
```

#### `alert:acknowledged`
Broadcasted when an alert is acknowledged.

```typescript
{
  type: 'alert:acknowledged',
  alertId: string,
  acknowledgedBy: string,
  timestamp: Date
}
```

#### `alert:updated`
Broadcasted when an alert is updated (status, assignment, etc).

```typescript
{
  type: 'alert:updated',
  alertId: string,
  changes: {
    status?: string,
    assignedTo?: string,
    assignedTeam?: string,
    ...
  },
  timestamp: Date
}
```

#### `alert:resolved`
Broadcasted when an alert is resolved.

```typescript
{
  type: 'alert:resolved',
  alertId: string,
  resolvedBy: string,
  timestamp: Date
}
```

### Incident Events

#### `incident:created`
Broadcasted when a new incident is created.

```typescript
{
  type: 'incident:created',
  incident: {
    id: string,
    title: string,
    description: string,
    severity: 'P1' | 'P2' | 'P3' | 'P4' | 'P5',
    status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED',
    responders: User[],
    teams: Team[],
    linkedAlertIds: string[],
    createdAt: Date,
    ...
  },
  timestamp: Date
}
```

#### `incident:updated`
Broadcasted when an incident is updated.

```typescript
{
  type: 'incident:updated',
  incidentId: string,
  changes: {
    status?: string,
    responders?: string[],
    ...
  },
  timestamp: Date
}
```

#### `incident:timeline-entry`
Broadcasted when a timeline entry is added to an incident.

```typescript
{
  type: 'incident:timeline-entry',
  incidentId: string,
  entry: {
    timestamp: Date,
    type: 'created' | 'update' | 'status-change',
    message: string,
    by: string,
  },
  timestamp: Date
}
```

### Notification Events

#### `notification:sent`
Broadcasted when a notification is sent to a user.

```typescript
{
  type: 'notification:sent',
  alert: Alert,
  channel: 'email' | 'sms' | 'phone' | 'slack' | 'push',
  timestamp: Date
}
```

## React Hooks

### `useWebSocket()`

Low-level hook for direct Socket.IO access:

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

export function MyComponent() {
  const { socket, isConnected, on, off, emit } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    on('custom:event', (data) => {
      console.log('Received:', data);
    });

    return () => {
      off('custom:event');
    };
  }, [isConnected, on, off]);

  return <div>{isConnected ? 'Connected' : 'Disconnected'}</div>;
}
```

### `useSocketEvent<T>(event, handler, deps)`

Hook for listening to specific events with automatic cleanup:

```typescript
import { useSocketEvent } from '@/hooks/useWebSocket';

export function AlertMonitor() {
  useSocketEvent('alert:created', (event) => {
    showNotification(`New alert: ${event.alert.title}`);
  }, []);

  return <div>Monitoring alerts...</div>;
}
```

### `useAlertEvents(orgId, handlers)`

Specialized hook for alert-related events:

```typescript
import { useAlertEvents } from '@/hooks/useWebSocket';

export function AlertList() {
  const [alerts, setAlerts] = useState([]);

  useAlertEvents(orgId, {
    onAlertCreated: (event) => {
      console.log('New alert:', event.alert);
      fetchAlerts(); // Refresh list
    },
    onAlertAcknowledged: (event) => {
      console.log('Alert acknowledged:', event.alertId);
      updateAlertInUI(event.alertId, { status: 'ACK' });
    },
    onAlertResolved: (event) => {
      console.log('Alert resolved:', event.alertId);
      updateAlertInUI(event.alertId, { status: 'RESOLVED' });
    },
  });

  return <AlertGrid alerts={alerts} />;
}
```

### `useIncidentEvents(orgId, handlers)`

Specialized hook for incident-related events:

```typescript
import { useIncidentEvents } from '@/hooks/useWebSocket';

export function IncidentTimeline() {
  const [timeline, setTimeline] = useState([]);

  useIncidentEvents(orgId, {
    onIncidentCreated: (event) => {
      toast.warning('New Incident', event.incident.title);
    },
    onTimelineEntry: (event) => {
      setTimeline((prev) => [...prev, event.entry]);
    },
  });

  return <Timeline entries={timeline} />;
}
```

### `useNotificationEvents(handlers)`

Hook for user-specific notification events:

```typescript
import { useNotificationEvents } from '@/hooks/useWebSocket';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);

  useNotificationEvents({
    onNotificationSent: (event) => {
      setNotifications((prev) => [...prev, {
        alert: event.alert.title,
        channel: event.channel,
        time: event.timestamp
      }]);
    },
  });

  return <NotificationList notifications={notifications} />;
}
```

## Toast Notifications

Use the `useSimpleToast()` hook to show user-friendly notifications:

```typescript
import { useSimpleToast } from '@/components/Toast';

export function MyComponent() {
  const toast = useSimpleToast();

  const handleAction = async () => {
    try {
      const result = await performAction();
      toast.success('Success', 'Action completed successfully');
    } catch (error) {
      toast.error('Error', error.message);
    }
  };

  return (
    <>
      <button onClick={handleAction}>Perform Action</button>
      {/* ToastContainer renders in app layout via Providers */}
    </>
  );
}
```

Available toast methods:
- `toast.success(title, message?)`
- `toast.error(title, message?)`
- `toast.info(title, message?)`
- `toast.warning(title, message?)`

## Server-Side Broadcasting

Broadcast events from API routes:

```typescript
import { broadcastAlertCreated } from '@/lib/socket';

export async function POST(request: NextRequest) {
  // ... create alert
  const alert = await prisma.alert.create({...});

  // Broadcast to all connected users in the org
  broadcastAlertCreated(orgId, alert);

  return NextResponse.json(alert);
}
```

### Available Broadcast Functions

```typescript
// Alert events
broadcastAlertCreated(orgId, alert)
broadcastAlertUpdated(orgId, alertId, changes)
broadcastAlertAcknowledged(orgId, alertId, userId)
broadcastAlertResolved(orgId, alertId, userId)

// Incident events
broadcastIncidentCreated(orgId, incident)
broadcastIncidentUpdated(orgId, incidentId, changes)
broadcastTimelineEntry(orgId, incidentId, entry)

// Notification events
broadcastNotificationSent(userId, alert, channel)

// Utilities
getConnectedUsersCount(orgId) // Returns number of connected users
isUserConnected(userId) // Checks if specific user is connected
sendToUser(userId, event, data) // Send direct message to user
sendToOrg(orgId, event, data) // Send to all users in org
```

## Implementation Examples

### Real-Time Dashboard

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAlertEvents, useIncidentEvents } from '@/hooks/useWebSocket';
import { useSimpleToast } from '@/components/Toast';

export function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const toast = useSimpleToast();

  const fetchDashboard = async () => {
    const res = await fetch('/api/v1/dashboard');
    const data = await res.json();
    setKpis(data);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useAlertEvents(orgId, {
    onAlertCreated: (event) => {
      toast.info('New Alert', `${event.alert.title} (${event.alert.severity})`);
      fetchDashboard(); // Refresh KPIs
    },
    onAlertResolved: () => {
      fetchDashboard(); // Update MTTR
    },
  });

  useIncidentEvents(orgId, {
    onIncidentCreated: (event) => {
      toast.warning('New Incident', event.incident.title);
      fetchDashboard(); // Update active incident count
    },
  });

  return <DashboardLayout kpis={kpis} />;
}
```

### Real-Time Alert List with Notifications

```typescript
'use client';

export function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const toast = useSimpleToast();

  useAlertEvents(orgId, {
    onAlertCreated: (event) => {
      // Show notification
      toast.info('New Alert', `${event.alert.severity}: ${event.alert.title}`);

      // Prepend to list if on first page
      setAlerts((prev) => [event.alert, ...prev.slice(0, 19)]);
    },
    onAlertAcknowledged: (event) => {
      // Update alert in list
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === event.alertId ? { ...a, status: 'ACK' } : a
        )
      );
    },
    onAlertResolved: (event) => {
      // Remove from list
      setAlerts((prev) => prev.filter((a) => a.id !== event.alertId));
      toast.success('Alert Resolved');
    },
  });

  return <AlertsTable alerts={alerts} />;
}
```

## Connection Management

Socket.IO automatically handles:
- **Reconnection**: Exponential backoff reconnection attempts (max 10 attempts)
- **Transports**: WebSocket preferred, falls back to polling
- **Authentication**: JWT token validated on each connection
- **Cleanup**: Automatic disconnect on component unmount

### Manual Connection Control

```typescript
const { socket, isConnected, emit } = useWebSocket();

// Send keep-alive ping
if (isConnected) {
  emit('ping');
}
```

## Performance Considerations

1. **Selective Subscriptions**: Only listen to events you need
2. **Debouncing**: Debounce frequent refreshes in real-time handlers
3. **Pagination**: Don't refresh entire lists on every event, update individual items
4. **Rate Limiting**: Backend limits broadcast frequency to prevent flooding

### Example: Debounced Refresh

```typescript
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

export function AlertsList() {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = useCallback(async () => {
    const res = await fetch('/api/v1/alerts');
    const data = await res.json();
    setAlerts(data.alerts);
  }, []);

  // Debounce to max once per 2 seconds
  const debouncedFetch = useMemo(
    () => debounce(fetchAlerts, 2000),
    [fetchAlerts]
  );

  useAlertEvents(orgId, {
    onAlertCreated: () => debouncedFetch(),
    onAlertUpdated: () => debouncedFetch(),
  });

  return <AlertsTable alerts={alerts} />;
}
```

## Troubleshooting

### Connection Failing

Check:
1. Socket.IO server is running (development: `npm run dev`)
2. `NEXTAUTH_SECRET` is set in `.env.local`
3. Browser console for authentication errors
4. Network tab for WebSocket handshake

### Events Not Received

Check:
1. Component is mounted and connected
2. Event handler is registered with correct event name
3. Data is being broadcasted on server (check logs)
4. User is in correct organization room

### Reconnection Issues

Socket.IO will attempt to reconnect automatically. If reconnection fails:
1. Check network connectivity
2. Verify server is still running
3. Check for JWT token expiration
4. Browser console for detailed error messages

## Production Deployment

For production with multiple server instances, use Socket.IO Redis adapter:

```bash
npm install @socket.io/redis-adapter redis
```

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ ... });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

This ensures events broadcast across all server instances.

## Security Considerations

1. **JWT Validation**: Token verified on every connection
2. **Organization Scoping**: Events only broadcast within organization rooms
3. **User Authorization**: Verify user has access to resource before broadcasting
4. **Rate Limiting**: Implement rate limiting on event frequency
5. **Input Validation**: Validate all event data before broadcasting

Example: Only broadcast if user is owner/admin

```typescript
const user = await prisma.user.findFirst({
  where: { id: userId, orgId },
});

if (user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}

// Safe to broadcast
broadcastAlertCreated(orgId, alert);
```
