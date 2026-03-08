'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { IncidentDetail } from '@/components/Incidents/IncidentDetail';

export default function IncidentDetailPage() {
  const params = useParams();
  const { id, subdomain } = params;

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);

        // Since we don't have a GET endpoint yet, we'll fetch from the list
        // In production, create a GET /api/v1/incidents/[id] endpoint
        const res = await fetch(`/api/v1/incidents?pageSize=100`);

        if (!res.ok) {
          throw new Error('Failed to fetch incident');
        }

        const data = await res.json();
        const foundIncident = data.incidents.find((i: any) => i.id === id);

        if (!foundIncident) {
          throw new Error('Incident not found');
        }

        setIncident(foundIncident);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIncident();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Incident not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <IncidentDetail incident={incident} orgSlug={subdomain as string} />
    </div>
  );
}
