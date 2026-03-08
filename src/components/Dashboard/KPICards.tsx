'use client';

import { Bell, Flame, BarChart3, Clock } from 'lucide-react';
import { KPICard } from './KPICard';

interface KPICardsProps {
  openAlerts: number;
  activeIncidents: number;
  mtta: number; // in minutes
  mttr: number; // in hours
  trends?: {
    alerts: { value: number; direction: 'up' | 'down' };
    incidents: { value: number; direction: 'up' | 'down' };
  };
}

export function KPICards({
  openAlerts,
  activeIncidents,
  mtta,
  mttr,
  trends,
}: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Open Alerts"
        value={openAlerts}
        trend={trends?.alerts}
        icon={<Bell className="w-6 h-6 text-white" />}
        color="bg-red-500"
      />
      <KPICard
        title="Active Incidents"
        value={activeIncidents}
        trend={trends?.incidents}
        icon={<Flame className="w-6 h-6 text-white" />}
        color="bg-orange-500"
      />
      <KPICard
        title="Mean Time to Ack"
        value={`${mtta}m`}
        icon={<Clock className="w-6 h-6 text-white" />}
        color="bg-blue-500"
      />
      <KPICard
        title="Mean Time to Resolve"
        value={`${mttr}h`}
        icon={<BarChart3 className="w-6 h-6 text-white" />}
        color="bg-green-500"
      />
    </div>
  );
}
