'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SEVERITY_LEVELS, ALERT_STATUSES } from '@/lib/constants';
import { Severity } from '@/lib/utils/severity';

interface AlertFiltersProps {
  onFiltersChange: (filters: AlertFiltersState) => void;
}

export interface AlertFiltersState {
  status: string[];
  severity: Severity[];
  team: string;
  assignee: string;
  dateRange: 'today' | 'week' | 'month' | 'all';
  source: string;
  search: string;
}

const initialFilters: AlertFiltersState = {
  status: [],
  severity: [],
  team: '',
  assignee: '',
  dateRange: 'week',
  source: '',
  search: '',
};

export function AlertFilters({ onFiltersChange }: AlertFiltersProps) {
  const [filters, setFilters] = useState<AlertFiltersState>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (newFilters: Partial<AlertFiltersState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleToggleStatus = (status: string) => {
    const updated = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    handleFilterChange({ status: updated });
  };

  const handleToggleSeverity = (severity: Severity) => {
    const updated = filters.severity.includes(severity)
      ? filters.severity.filter((s) => s !== severity)
      : [...filters.severity, severity];
    handleFilterChange({ severity: updated });
  };

  const handleClear = () => {
    setFilters(initialFilters);
    onFiltersChange(initialFilters);
  };

  const activeFilterCount = [
    filters.status.length,
    filters.severity.length,
    filters.team ? 1 : 0,
    filters.assignee ? 1 : 0,
    filters.dateRange !== 'week' ? 1 : 0,
    filters.source ? 1 : 0,
    filters.search ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search alerts by title or description..."
          value={filters.search}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ALERT_STATUSES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleToggleStatus(key)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                filters.status.includes(key)
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Severity Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Severity
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SEVERITY_LEVELS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleToggleSeverity(key as Severity)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                filters.severity.includes(key as Severity)
                  ? `text-white`
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: filters.severity.includes(key as Severity)
                  ? config.color
                  : undefined,
              }}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-600 hover:underline"
      >
        {showAdvanced ? 'Hide' : 'Show'} advanced filters
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                handleFilterChange({
                  dateRange: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source/Integration
            </label>
            <input
              type="text"
              placeholder="e.g., Datadog, Grafana..."
              value={filters.source}
              onChange={(e) => handleFilterChange({ source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team
            </label>
            <input
              type="text"
              placeholder="Filter by team..."
              value={filters.team}
              onChange={(e) => handleFilterChange({ team: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To
            </label>
            <input
              type="text"
              placeholder="Filter by assignee..."
              value={filters.assignee}
              onChange={(e) => handleFilterChange({ assignee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        {activeFilterCount > 0 && (
          <span className="text-sm text-gray-600">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </span>
        )}
        {activeFilterCount > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <X size={16} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
