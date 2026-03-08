'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { IncidentList } from '@/components/Incidents/IncidentList';
import { useIncidentEvents } from '@/hooks/useWebSocket';
import { useSimpleToast } from '@/components/Toast';

export default function IncidentsPage() {
  const params = useParams();
  const orgSlug = params.subdomain;
  const toast = useSimpleToast();

  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const pageSize = 20;

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('pageSize', pageSize.toString());
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const res = await fetch(`/api/v1/incidents?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch incidents');

      const data = await res.json();
      setIncidents(data.incidents);
      setTotalCount(data.totalCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchIncidents();
  }, [currentPage, statusFilter]);

  // Listen to real-time incident events
  useIncidentEvents(orgSlug as string, {
    onIncidentCreated: (event: any) => {
      toast.warning('New Incident', event.incident.title);
      if (currentPage === 1 && !statusFilter) {
        fetchIncidents();
      }
    },
    onIncidentUpdated: () => {
      fetchIncidents();
    },
    onTimelineEntry: () => {
      // Don't refresh on every timeline entry, just notify
      toast.info('Incident Updated', 'Timeline entry added');
    },
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to incidents
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          <Plus size={20} />
          Create Incident
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Filter by Status</p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: '', label: 'All' },
            { value: 'INVESTIGATING', label: 'Investigating' },
            { value: 'IDENTIFIED', label: 'Identified' },
            { value: 'MONITORING', label: 'Monitoring' },
            { value: 'RESOLVED', label: 'Resolved' },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`px-4 py-2 rounded text-sm font-medium transition ${
                statusFilter === status.value
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <IncidentList
        incidents={incidents}
        orgSlug={orgSlug as string}
        isLoading={loading}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
