'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { KPICards } from '@/components/Dashboard/KPICards';
import { AlertTrendChart } from '@/components/Dashboard/AlertTrendChart';
import { ActiveIncidents } from '@/components/Dashboard/ActiveIncidents';
import { OnCallWidget } from '@/components/Dashboard/OnCallWidget';
import { ActivityFeed } from '@/components/Dashboard/ActivityFeed';
import { useAlertEvents, useIncidentEvents } from '@/hooks/useWebSocket';
import { useSimpleToast } from '@/components/Toast';

interface DashboardData {
  kpis: {
    openAlerts: number;
    activeIncidents: number;
    mtta: number;
    mttr: number;
  };
  incidents: any[];
  onCallPeople: any[];
  activities: any[];
}

export default function DashboardPage() {
  const params = useParams();
  const orgSlug = params.subdomain;
  const toast = useSimpleToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/v1/dashboard');

      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchDashboardData().then(() => setLoading(false));
  }, []);

  // Listen to real-time alert and incident events
  useAlertEvents(orgSlug as string, {
    onAlertCreated: (event: any) => {
      toast.info('New Alert', `${event.alert.title} (${event.alert.severity})`);
      // Refresh dashboard data
      fetchDashboardData();
    },
    onAlertAcknowledged: () => {
      fetchDashboardData();
    },
    onAlertResolved: () => {
      toast.success('Alert Resolved', 'An alert has been resolved');
      fetchDashboardData();
    },
  });

  useIncidentEvents(orgSlug as string, {
    onIncidentCreated: (event: any) => {
      toast.warning('New Incident', event.incident.title);
      fetchDashboardData();
    },
    onIncidentUpdated: () => {
      fetchDashboardData();
    },
    onTimelineEntry: () => {
      fetchDashboardData();
    },
  });

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Failed to load dashboard data'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor your alerts and incidents in real-time
        </p>
      </div>

      {/* KPI Cards */}
      <KPICards
        openAlerts={data.kpis.openAlerts}
        activeIncidents={data.kpis.activeIncidents}
        mtta={data.kpis.mtta}
        mttr={data.kpis.mttr}
        trends={{
          alerts: { value: 12, direction: 'up' },
          incidents: { value: 5, direction: 'down' },
        }}
      />

      {/* Chart and Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertTrendChart />
        </div>
        <div>
          <ActiveIncidents incidents={data.incidents} orgSlug={orgSlug as string} />
        </div>
      </div>

      {/* On-Call and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OnCallWidget onCallPeople={data.onCallPeople} orgSlug={orgSlug as string} />
        <ActivityFeed activities={data.activities} orgSlug={orgSlug as string} />
      </div>
    </div>
  );
}
