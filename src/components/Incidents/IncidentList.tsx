'use client';

import Link from 'next/link';
import { Plus, Flame } from 'lucide-react';
import { formatTimeAgo, formatDuration } from '@/lib/utils/formatting';
import { INCIDENT_STATUSES, SEVERITY_LEVELS } from '@/lib/constants';

interface IncidentListProps {
  incidents: any[];
  orgSlug: string;
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function IncidentList({
  incidents,
  orgSlug,
  isLoading,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
}: IncidentListProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Flame size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No incidents yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Create an incident to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Severity
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Title
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Responders
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Duration
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Alerts
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incidents.map((incident) => {
              const severity = SEVERITY_LEVELS[incident.severity];
              const statusConfig = INCIDENT_STATUSES[incident.status];

              return (
                <tr key={incident.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: severity.color }}
                      />
                      <span className="font-medium">{incident.severity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${orgSlug}/incidents/${incident.id}`}
                      className="text-blue-600 hover:underline font-medium truncate"
                      title={incident.title}
                    >
                      {incident.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {incident.responderIds && incident.responderIds.length > 0 ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {incident.responderIds[0]?.charAt(0) || 'R'}
                          </div>
                          {incident.responderIds.length > 1 && (
                            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                              +{incident.responderIds.length - 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDuration(incident.createdAt, incident.resolvedAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {incident.linkedAlertIds?.length || 0}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
