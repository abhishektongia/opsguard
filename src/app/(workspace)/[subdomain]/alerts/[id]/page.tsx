'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertDetail } from '@/components/Alerts/AlertDetail';

export default function AlertDetailPage() {
  const params = useParams();
  const { id, subdomain } = params;

  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/alerts/${id}`);

        if (!res.ok) {
          throw new Error('Failed to fetch alert');
        }

        const data = await res.json();
        setAlert(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAlert();
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

  if (error || !alert) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Alert not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <AlertDetail alert={alert} orgSlug={subdomain as string} />
    </div>
  );
}
