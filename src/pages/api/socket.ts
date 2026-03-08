import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeSocketServer } from '@/lib/socket';

// Create HTTP server for socket upgrade
const httpServer = createServer();
let socketInitialized = false;

/**
 * Socket.IO handler for Next.js
 * This needs to be run in a custom server or serverless function with native HTTP support
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize Socket.IO on first request
    if (!socketInitialized) {
      initializeSocketServer(httpServer);
      socketInitialized = true;
      console.log('Socket.IO server initialized');
    }

    // Check if this is a socket upgrade request
    if (req.method === 'GET' && req.headers.upgrade === 'websocket') {
      // Socket upgrade will be handled by Socket.IO
      return;
    }

    // Regular HTTP request - return simple response
    res.status(200).json({
      message: 'Socket.IO endpoint',
      status: 'listening',
    });
  } catch (error) {
    console.error('Socket.IO handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
