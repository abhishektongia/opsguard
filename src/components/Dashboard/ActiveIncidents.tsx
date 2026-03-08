'use client';

import Link from 'next/link';
import { formatTimeAgo, formatDuration } from '@/lib/utils/formatting';
import { INCIDENT_STATUSES, SEVERITY_LEVELS } from '@/lib/constants';

interface Incident {
  id: string;
  title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
  responderIds: string[];
  createdAt: Date;
  resolvedAt?: Date | null;
}

interface ActiveIncidentsProps {
  incidents: Incident[];
  orgSlug: string;
}

export function ActiveIncidents({ incidents, orgSlug }: ActiveIncidentsProps) {
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Active Incidents</h2>
        <Link
          href={`/${orgSlug}/incidents`}
          className="text-sm text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>

      {activeIncidents.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          No active incidents
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Severity
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Title
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Duration
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Responders
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeIncidents.map((incident) => {
                const statusConfig =
                  INCIDENT_STATUSES[incident.status as keyof typeof INCIDENT_STATUSES];
                const severityConfig = SEVERITY_LEVELS[incident.severity];

                return (
                  <tr
                    key={incident.id}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: severityConfig.color }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/${orgSlug}/incidents/${incident.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {incident.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDuration(incident.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {incident.responderIds.length > 0 ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                              {incident.responderIds[0]?.charAt(0).toUpperCase()}
                            </div>
                            {incident.responderIds.length > 1 && (
                              <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                                +{incident.responderIds.length - 1}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500 text-xs">No responders</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
