'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ScheduleList } from '@/components/OnCall/ScheduleList';
import { ScheduleBuilder } from '@/components/OnCall/ScheduleBuilder';

export default function OnCallPage() {
  const params = useParams();
  const orgSlug = params.subdomain;

  const [schedules, setSchedules] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, teamsRes, usersRes] = await Promise.all([
        fetch('/api/v1/schedules'),
        fetch('/api/v1/teams'),
        fetch('/api/v1/users'),
      ]);

      if (!schedulesRes.ok || !teamsRes.ok || !usersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const schedulesData = await schedulesRes.json();
      const teamsData = await teamsRes.json();
      const usersData = await usersRes.json();

      setSchedules(schedulesData);
      setTeams(teamsData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSchedule = async (scheduleData: any) => {
    const res = await fetch('/api/v1/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData),
    });

    if (!res.ok) {
      throw new Error('Failed to create schedule');
    }

    setShowBuilder(false);
    fetchData();
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    const res = await fetch(`/api/v1/schedules/${scheduleId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchData();
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">On-Call Schedules</h1>
          <p className="text-gray-600 mt-2">
            Manage team on-call rotations and schedules
          </p>
        </div>
        {!showBuilder && (
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Create Schedule
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Schedule Builder */}
      {showBuilder && (
        <ScheduleBuilder
          teams={teams}
          users={users}
          onScheduleCreate={handleCreateSchedule}
          isLoading={loading}
        />
      )}

      {/* Schedule List */}
      {!showBuilder && (
        <ScheduleList
          schedules={schedules}
          orgSlug={orgSlug as string}
          isLoading={loading}
          onDelete={handleDeleteSchedule}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}
