'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

// Types for socket events
export type SocketEventHandler<T = any> = (data: T) => void;

interface UseWebSocketReturnType {
  socket: Socket | null;
  isConnected: boolean;
  on: <T = any>(event: string, handler: SocketEventHandler<T>) => void;
  off: (event: string, handler?: SocketEventHandler) => void;
  emit: (event: string, data?: any) => void;
}

/**
 * Custom hook for using WebSocket with Socket.IO
 * Automatically handles authentication and reconnection
 */
export function useWebSocket(): UseWebSocketReturnType {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<Map<string, SocketEventHandler[]>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user) {
      return; // Wait for session
    }

    // Avoid creating multiple connections
    if (socketRef.current?.connected) {
      return;
    }

    try {
      // Get JWT token from session
      const token = (session as any).accessToken || '';

      // Create socket connection
      const socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin,
        {
          auth: {
            token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 10,
          transports: ['websocket', 'polling'],
        },
      );

      // Connection success
      socket.on('connected', (data) => {
        console.log('Socket.IO connected:', data);
        setIsConnected(true);
      });

      // Connection error
      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        setIsConnected(false);
      });

      // Disconnection
      socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        setIsConnected(false);
      });

      // Reconnection
      socket.on('reconnect', () => {
        console.log('Socket.IO reconnected');
        setIsConnected(true);
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('Failed to initialize Socket.IO:', error);
    }

    return () => {
      // Cleanup on unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [session?.user]);

  // Subscribe to event
  const on = useCallback(<T = any,>(event: string, handler: SocketEventHandler<T>) => {
    if (!socketRef.current) {
      console.warn(`Socket not connected, cannot subscribe to ${event}`);
      return;
    }

    // Store handler reference for cleanup
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, []);
    }
    handlersRef.current.get(event)!.push(handler as SocketEventHandler);

    // Subscribe to event
    socketRef.current.on(event, handler);
  }, []);

  // Unsubscribe from event
  const off = useCallback((event: string, handler?: SocketEventHandler) => {
    if (!socketRef.current) return;

    if (handler) {
      socketRef.current.off(event, handler);
      const handlers = handlersRef.current.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    } else {
      socketRef.current.off(event);
      handlersRef.current.delete(event);
    }
  }, []);

  // Emit event
  const emit = useCallback((event: string, data?: any) => {
    if (!socketRef.current) {
      console.warn(`Socket not connected, cannot emit ${event}`);
      return;
    }

    socketRef.current.emit(event, data);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    on,
    off,
    emit,
  };
}

/**
 * Hook for listening to specific events
 * Automatically cleans up listeners on unmount
 */
export function useSocketEvent<T = any>(
  event: string,
  handler: SocketEventHandler<T>,
  deps: any[] = [],
) {
  const { on, off } = useWebSocket();

  useEffect(() => {
    on<T>(event, handler);

    return () => {
      off(event, handler);
    };
  }, [event, ...deps, on, off]);
}

/**
 * Hook for listening to alert-related events
 */
export function useAlertEvents(
  orgId: string,
  handlers: {
    onAlertCreated?: SocketEventHandler;
    onAlertUpdated?: SocketEventHandler;
    onAlertAcknowledged?: SocketEventHandler;
    onAlertResolved?: SocketEventHandler;
  },
) {
  useSocketEvent('alert:created', handlers.onAlertCreated || (() => {}), [orgId]);
  useSocketEvent('alert:updated', handlers.onAlertUpdated || (() => {}), [orgId]);
  useSocketEvent('alert:acknowledged', handlers.onAlertAcknowledged || (() => {}), [orgId]);
  useSocketEvent('alert:resolved', handlers.onAlertResolved || (() => {}), [orgId]);
}

/**
 * Hook for listening to incident-related events
 */
export function useIncidentEvents(
  orgId: string,
  handlers: {
    onIncidentCreated?: SocketEventHandler;
    onIncidentUpdated?: SocketEventHandler;
    onTimelineEntry?: SocketEventHandler;
  },
) {
  useSocketEvent('incident:created', handlers.onIncidentCreated || (() => {}), [orgId]);
  useSocketEvent('incident:updated', handlers.onIncidentUpdated || (() => {}), [orgId]);
  useSocketEvent('incident:timeline-entry', handlers.onTimelineEntry || (() => {}), [orgId]);
}

/**
 * Hook for listening to notification events
 */
export function useNotificationEvents(
  handlers: {
    onNotificationSent?: SocketEventHandler;
  },
) {
  useSocketEvent('notification:sent', handlers.onNotificationSent || (() => {}), []);
}
