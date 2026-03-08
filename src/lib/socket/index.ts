import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

// Types for socket events
export interface SocketUser {
  userId: string;
  email: string;
  orgId: string;
  orgSlug: string;
}

export interface SocketData extends SocketUser {
  socketId: string;
}

// Global socket instance
let io: Server | null = null;
const connectedUsers: Map<string, SocketData> = new Map();

/**
 * Initialize Socket.IO server
 */
export function initializeSocketServer(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware: Authenticate socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as any;

      // Attach user data to socket
      socket.data = {
        userId: decoded.sub,
        email: decoded.email,
        orgId: decoded.orgId,
        orgSlug: decoded.orgSlug,
        socketId: socket.id,
      };

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const user = socket.data as SocketData;

    // Store user connection
    connectedUsers.set(socket.id, user);

    // Join organization room for broadcasts
    socket.join(`org:${user.orgId}`);
    socket.join(`user:${user.userId}`);

    console.log(`User ${user.email} connected (${socket.id})`);

    // Emit connected event
    socket.emit('connected', {
      socketId: socket.id,
      user,
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      console.log(`User ${user.email} disconnected`);
    });

    // Keep-alive ping
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  return io;
}

/**
 * Get Socket.IO instance
 */
export function getSocketServer(): Server {
  if (!io) {
    throw new Error('Socket.IO server not initialized');
  }
  return io;
}

/**
 * Broadcast alert:created event to organization
 */
export function broadcastAlertCreated(orgId: string, alert: any) {
  if (!io) return;

  io.to(`org:${orgId}`).emit('alert:created', {
    type: 'alert:created',
    alert,
    timestamp: new Date(),
  });

  console.log(`Broadcast alert:created to org ${orgId}`);
}

/**
 * Broadcast alert:updated event
 */
export function broadcastAlertUpdated(orgId: string, alertId: string, changes: any) {
  if (!io) return;

  io.to(`org:${orgId}`).emit('alert:updated', {
    type: 'alert:updated',
    alertId,
    changes,
    timestamp: new Date(),
  });

  console.log(`Broadcast alert:updated for ${alertId}`);
}

/**
 * Broadcast alert:acknowledged event
 */
export function broadcastAlertAcknowledged(orgId: string, alertId: string, userId: string) {
  if (!io) return;

  io.to(`org:${orgId}`).emit('alert:acknowledged', {
    type: 'alert:acknowledged',
    alertId,
    acknowledgedBy: userId,
    timestamp: new Date(),
  });
}

/**
 * Broadcast alert:resolved event
 */
export function broadcastAlertResolved(orgId: string, alertId: string, userId: string) {
  if (!io) return;

  io.to(`org:${orgId}`).emit('alert:resolved', {
    type: 'alert:resolved',
    alertId,
    resolvedBy: userId,
    timestamp: new Date(),
  });
}

/**
 * Broadcast incident:created event
 */
export function broadcastIncidentCreated(orgId: string, incident: any) {
  if (!io) return;

  io.to(`org:${orgId}`).emit('incident:created', {
    type: 'incident:created',
    incident,
    timestamp: new Date(),
  });

  console.log(`Broadcast incident:created to org ${orgId}`);
}

/**
 * Broadcast incident:updated event
 */
export function broadcastIncidentUpdated(orgId: string, incidentId: string, changes: any) {
  if (!io) return;

  io.to(`org:${orgId}`).emit('incident:updated', {
    type: 'incident:updated',
    incidentId,
    changes,
    timestamp: new Date(),
  });
}

/**
 * Broadcast timeline:entry added event
 */
export function broadcastTimelineEntry(orgId: string, incidentId: string, entry: any) {
  if (!io) return;

  io.to(`org:${orgId}`).emit('incident:timeline-entry', {
    type: 'incident:timeline-entry',
    incidentId,
    entry,
    timestamp: new Date(),
  });
}

/**
 * Broadcast notification sent event
 */
export function broadcastNotificationSent(
  userId: string,
  alert: any,
  channel: string,
) {
  if (!io) return;

  io.to(`user:${userId}`).emit('notification:sent', {
    type: 'notification:sent',
    alert,
    channel,
    timestamp: new Date(),
  });
}

/**
 * Get connected users count for an organization
 */
export function getConnectedUsersCount(orgId: string): number {
  return Array.from(connectedUsers.values()).filter(
    (user) => user.orgId === orgId,
  ).length;
}

/**
 * Check if specific user is connected
 */
export function isUserConnected(userId: string): boolean {
  return Array.from(connectedUsers.values()).some((user) => user.userId === userId);
}

/**
 * Send direct message to user
 */
export function sendToUser(userId: string, event: string, data: any) {
  if (!io) return;

  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Send to all users in organization
 */
export function sendToOrg(orgId: string, event: string, data: any) {
  if (!io) return;

  io.to(`org:${orgId}`).emit(event, data);
}
