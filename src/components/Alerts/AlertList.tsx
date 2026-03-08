'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils/formatting';
import { SEVERITY_LEVELS, ALERT_STATUSES } from '@/lib/constants';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface AlertListProps {
  alerts: any[];
  orgSlug: string;
  onSelectionChange?: (selectedIds: string[]) => void;
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

type SortField = 'severity' | 'created' | 'title' | 'status';
type SortOrder = 'asc' | 'desc';

export function AlertList({
  alerts,
  orgSlug,
  onSelectionChange,
  isLoading,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
}: AlertListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('created');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSelectAlert = (alertId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSelectAll = () => {
    if (selectedIds.size === alerts.length) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(alerts.map((a) => a.id));
      setSelectedIds(allIds);
      onSelectionChange?.(Array.from(allIds));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={16} className="opacity-0" />;
    return sortOrder === 'asc' ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No alerts found</p>
        <p className="text-gray-400 text-sm mt-1">
          Alerts will appear here as they are created
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
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === alerts.length && alerts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('severity')}
                  className="flex items-center gap-1 hover:text-gray-900 transition"
                >
                  Severity
                  <SortIcon field="severity" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1 hover:text-gray-900 transition"
                >
                  Title
                  <SortIcon field="title" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Source
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-gray-900 transition"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('created')}
                  className="flex items-center gap-1 hover:text-gray-900 transition"
                >
                  Created
                  <SortIcon field="created" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {alerts.map((alert) => {
              const severity = SEVERITY_LEVELS[alert.severity];
              const statusConfig = ALERT_STATUSES[alert.status];
              const isSelected = selectedIds.has(alert.id);

              return (
                <tr
                  key={alert.id}
                  className={`hover:bg-gray-50 transition ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectAlert(alert.id)}
                      className="rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: severity.color }}
                      />
                      <span className="font-medium">{alert.severity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${orgSlug}/alerts/${alert.id}`}
                      className="text-blue-600 hover:underline font-medium truncate"
                      title={alert.title}
                    >
                      {alert.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{alert.source}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {alert.assignedTo?.name || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {formatTimeAgo(alert.createdAt)}
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
            Page {currentPage} of {totalPages} ({totalCount} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
