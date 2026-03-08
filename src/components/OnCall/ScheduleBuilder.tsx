'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface ScheduleBuilderProps {
  teams: any[];
  users: any[];
  onScheduleCreate: (schedule: any) => Promise<void>;
  isLoading?: boolean;
}

export function ScheduleBuilder({
  teams,
  users,
  onScheduleCreate,
  isLoading,
}: ScheduleBuilderProps) {
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [rotationType, setRotationType] = useState('WEEKLY');
  const [rotations, setRotations] = useState<any[]>([]);
  const [newRotation, setNewRotation] = useState({
    userId: '',
    startTime: '',
    endTime: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRotation = () => {
    if (!newRotation.userId || !newRotation.startTime || !newRotation.endTime) {
      setError('Please fill in all rotation fields');
      return;
    }

    if (new Date(newRotation.endTime) <= new Date(newRotation.startTime)) {
      setError('End time must be after start time');
      return;
    }

    setRotations([...rotations, { ...newRotation, id: Date.now() }]);
    setNewRotation({ userId: '', startTime: '', endTime: '' });
    setError(null);
  };

  const handleRemoveRotation = (id: number) => {
    setRotations(rotations.filter((r) => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !teamId || rotations.length === 0) {
      setError('Please fill in all required fields and add at least one rotation');
      return;
    }

    setIsSubmitting(true);
    try {
      await onScheduleCreate({
        name,
        teamId,
        timezone,
        rotationType,
        rotations: rotations.map((r) => ({
          userId: r.userId,
          startTime: r.startTime,
          endTime: r.endTime,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Schedule</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Schedule Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Backend Weekly"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a team...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern (EST/EDT)</option>
              <option value="America/Chicago">Central (CST/CDT)</option>
              <option value="America/Denver">Mountain (MST/MDT)</option>
              <option value="America/Los_Angeles">Pacific (PST/PDT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Berlin (CET/CEST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Singapore">Singapore (SGT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rotation Type
            </label>
            <select
              value={rotationType}
              onChange={(e) => setRotationType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
        </div>

        {/* Rotations */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add Rotations
          </h3>

          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  value={newRotation.userId}
                  onChange={(e) =>
                    setNewRotation({ ...newRotation, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start
                </label>
                <input
                  type="datetime-local"
                  value={newRotation.startTime}
                  onChange={(e) =>
                    setNewRotation({ ...newRotation, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End
                </label>
                <input
                  type="datetime-local"
                  value={newRotation.endTime}
                  onChange={(e) =>
                    setNewRotation({ ...newRotation, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddRotation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
            >
              <Plus size={18} />
              Add Rotation
            </button>
          </div>

          {/* Rotation List */}
          {rotations.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                {rotations.map((rotation) => {
                  const user = users.find((u) => u.id === rotation.userId);
                  return (
                    <div
                      key={rotation.id}
                      className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                    >
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {user?.name || 'Unknown'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(rotation.startTime).toLocaleDateString()} →{' '}
                          {new Date(rotation.endTime).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRotation(rotation.id)}
                        className="p-1 hover:bg-red-100 rounded transition"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-2 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium"
          >
            {isSubmitting ? 'Creating...' : 'Create Schedule'}
          </button>
          <button
            type="button"
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
