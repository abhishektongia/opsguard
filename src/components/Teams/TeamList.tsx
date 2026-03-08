'use client';

import { useState } from 'react';
import { Users, Edit2, Trash2, UserPlus } from 'lucide-react';

interface TeamListProps {
  teams: any[];
  orgSlug: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function TeamList({ teams, orgSlug, onRefresh, isLoading }: TeamListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (teamId: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteConfirm(null);
        onRefresh();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Users size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No teams yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Create a team to organize your users
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <div
          key={team.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              {team.description && (
                <p className="text-sm text-gray-600 mt-1">{team.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Members</span>
              <span className="font-semibold">{team._count?.members || 0}</span>
            </div>
            {team.schedule && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">On-Call Schedule</span>
                <span className="font-semibold text-blue-600">{team.schedule.name}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium">
              <UserPlus size={16} />
              Add Member
            </button>
            <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setDeleteConfirm(team.id)}
              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {deleteConfirm === team.id && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700 mb-2">Delete team?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(team.id)}
                  disabled={isDeleting}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:bg-red-400"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
