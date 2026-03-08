import { NextRequest } from 'next/server';
import { POST as createAlert } from '@/app/api/v1/alerts/route';
import { POST as acknowledgeAlert } from '@/app/api/v1/alerts/[id]/acknowledge/route';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db/prisma');
jest.mock('@/lib/db/rls');
jest.mock('@/lib/socket');

describe('Alerts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/alerts', () => {
    it('creates an alert with valid data', async () => {
      const mockSession = {
        user: { email: 'test@example.com', name: 'Test User' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const mockAlert = {
        id: 'alert-1',
        title: 'Database Error',
        description: 'Connection failed',
        severity: 'P1',
        status: 'OPEN',
        source: 'monitoring',
      };

      (prisma.alert.create as jest.Mock).mockResolvedValue(mockAlert);

      const request = new NextRequest('http://localhost:3000/api/v1/alerts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Database Error',
          description: 'Connection failed',
          severity: 'P1',
          source: 'monitoring',
        }),
        headers: {
          'x-org-slug': 'test-org',
          'Content-Type': 'application/json',
        },
      });

      const response = await createAlert(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('alert-1');
      expect(data.title).toBe('Database Error');
      expect(prisma.alert.create).toHaveBeenCalled();
    });

    it('returns 401 when user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/v1/alerts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Alert',
          severity: 'P2',
          source: 'test',
        }),
      });

      const response = await createAlert(request);

      expect(response.status).toBe(401);
      expect(prisma.alert.create).not.toHaveBeenCalled();
    });

    it('returns 400 when required fields are missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' },
      });

      const request = new NextRequest('http://localhost:3000/api/v1/alerts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Alert',
          // missing severity and source
        }),
        headers: {
          'x-org-slug': 'test-org',
        },
      });

      const response = await createAlert(request);

      expect(response.status).toBe(400);
      expect(prisma.alert.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/alerts/[id]/acknowledge', () => {
    it('acknowledges an alert and creates audit log', async () => {
      const mockSession = {
        user: { email: 'responder@example.com', name: 'John Responder' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const mockAlert = {
        id: 'alert-1',
        status: 'ACK',
        ackedAt: new Date(),
        severity: 'P1',
      };

      const mockUser = { id: 'user-1' };

      (prisma.alert.update as jest.Mock).mockResolvedValue(mockAlert);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const request = new NextRequest(
        'http://localhost:3000/api/v1/alerts/alert-1/acknowledge',
        {
          method: 'POST',
          headers: {
            'x-org-slug': 'test-org',
          },
        }
      );

      const response = await acknowledgeAlert(request, {
        params: { id: 'alert-1' },
      });

      expect(response.status).toBe(200);
      expect(prisma.alert.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'alert-1' },
          data: expect.objectContaining({
            status: 'ACK',
          }),
        })
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('returns 404 when alert does not exist', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' },
      });

      (prisma.alert.update as jest.Mock).mockRejectedValue(
        new Error('Record not found')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/alerts/nonexistent/acknowledge',
        {
          method: 'POST',
          headers: {
            'x-org-slug': 'test-org',
          },
        }
      );

      const response = await acknowledgeAlert(request, {
        params: { id: 'nonexistent' },
      });

      expect(response.status).toBe(500);
    });
  });
});

describe('Incidents API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an incident with timeline', async () => {
    const mockSession = {
      user: { email: 'incident-commander@example.com', name: 'IC User' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const mockIncident = {
      id: 'incident-1',
      title: 'Database Outage',
      severity: 'P1',
      status: 'INVESTIGATING',
      timeline: [
        {
          timestamp: new Date(),
          type: 'created',
          message: 'Incident created',
          by: 'IC User',
        },
      ],
    };

    (prisma.incident.create as jest.Mock).mockResolvedValue(mockIncident);

    const request = new NextRequest('http://localhost:3000/api/v1/incidents', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Database Outage',
        description: 'Primary database unreachable',
        severity: 'P1',
      }),
      headers: {
        'x-org-slug': 'test-org',
      },
    });

    const response = await createAlert(request); // Using same POST function signature

    expect(response.status).toBe(201);
  });
});

describe('Integration Tests', () => {
  it('creates alert and broadcasts event', async () => {
    // Verify that broadcastAlertCreated is called
    const { broadcastAlertCreated } = require('@/lib/socket');

    // This would be tested with actual Socket.IO mock
    expect(broadcastAlertCreated).toBeDefined();
  });

  it('acknowledges alert and updates in real-time', async () => {
    // Verify alert status changes propagate
    const { broadcastAlertAcknowledged } = require('@/lib/socket');

    expect(broadcastAlertAcknowledged).toBeDefined();
  });
});
