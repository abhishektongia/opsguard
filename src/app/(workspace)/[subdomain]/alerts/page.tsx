'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { AlertFilters, AlertFiltersState } from '@/components/Alerts/AlertFilters';
import { AlertList } from '@/components/Alerts/AlertList';
import { BulkActions } from '@/components/Alerts/BulkActions';
import { useAlertEvents } from '@/hooks/useWebSocket';
import { useSimpleToast } from '@/components/Toast';

export default function AlertsPage() {
  const params = useParams();
  const orgSlug = params.subdomain;
  const toast = useSimpleToast();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<AlertFiltersState>({
    status: [],
    severity: [],
    team: '',
    assignee: '',
    dateRange: 'week',
    source: '',
    search: '',
  });

  const pageSize = 20;

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('pageSize', pageSize.toString());

      if (filters.status.length > 0) {
        filters.status.forEach((s) => params.append('status', s));
      }
      if (filters.severity.length > 0) {
        filters.severity.forEach((s) => params.append('severity', s));
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.source) {
        params.append('source', filters.source);
      }
      if (filters.team) {
        params.append('team', filters.team);
      }

      const res = await fetch(`/api/v1/alerts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch alerts');

      const data = await res.json();
      setAlerts(data.alerts);
      setTotalCount(data.totalCount);
      setSelectedIds([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchAlerts();
  }, [currentPage, filters]);

  // Listen to real-time alert events
  useAlertEvents(orgSlug as string, {
    onAlertCreated: (event: any) => {
      // Show toast notification
      toast.info('New Alert', `${event.alert.title} (${event.alert.severity})`);
      // If on first page, refresh alerts
      if (currentPage === 1) {
        fetchAlerts();
      }
    },
    onAlertAcknowledged: () => {
      fetchAlerts();
    },
    onAlertResolved: () => {
      fetchAlerts();
    },
  });

  const handleFiltersChange = (newFilters: AlertFiltersState) => {
    setFilters(newFilters);
  };

  const handleBulkAcknowledge = async () => {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/alerts/${id}/acknowledge`, { method: 'POST' }),
        ),
      );
      fetchAlerts();
    } catch (err) {
      setError('Failed to acknowledge alerts');
    }
  };

  const handleBulkClose = async () => {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/alerts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CLOSED' }),
          }),
        ),
      );
      fetchAlerts();
    } catch (err) {
      setError('Failed to close alerts');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to alerts from your monitoring systems
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus size={20} />
          Create Alert
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <AlertFilters onFiltersChange={handleFiltersChange} />

      {/* Alert List */}
      <AlertList
        alerts={alerts}
        orgSlug={orgSlug as string}
        onSelectionChange={setSelectedIds}
        isLoading={loading}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.length}
        onAcknowledge={handleBulkAcknowledge}
        onAssign={() => console.log('Assign not implemented yet')}
        onClose={handleBulkClose}
        onMerge={() => console.log('Merge not implemented yet')}
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}
