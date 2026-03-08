'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { TeamList } from '@/components/Teams/TeamList';
import { CreateTeamModal } from '@/components/Teams/CreateTeamModal';

export default function TeamsPage() {
  const params = useParams();
  const orgSlug = params.subdomain;

  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/teams');

      if (!res.ok) throw new Error('Failed to fetch teams');

      const data = await res.json();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (data: { name: string; description: string }) => {
    const res = await fetch('/api/v1/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Failed to create team');
    }

    fetchTeams();
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-2">
            Organize your members into teams and manage on-call schedules
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Create Team
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Team List */}
      <TeamList
        teams={teams}
        orgSlug={orgSlug as string}
        onRefresh={fetchTeams}
        isLoading={loading}
      />

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTeam}
      />
    </div>
  );
}
