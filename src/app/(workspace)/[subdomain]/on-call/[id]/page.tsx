'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';

interface Rotation {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
}

interface Schedule {
  id: string;
  name: string;
  teamId: string;
  team: {
    name: string;
  };
  rotationType: string;
  timezone: string;
  rotations: Rotation[];
  createdAt: string;
  updatedAt: string;
}

export default function ScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params.id as string;
  const orgSlug = params.subdomain as string;

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    timezone: '',
  });

  useEffect(() => {
    fetchSchedule();
  }, [scheduleId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/schedules/${scheduleId}`);

      if (!res.ok) {
        throw new Error('Failed to fetch schedule');
      }

      const data = await res.json();
      setSchedule(data);
      setFormData({
        name: data.name,
        timezone: data.timezone,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!schedule) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          timezone: formData.timezone,
          rotations: schedule.rotations.map((r) => ({
            userId: r.userId,
            startTime: new Date(r.startTime).toISOString(),
            endTime: new Date(r.endTime).toISOString(),
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update schedule');
      }

      const updated = await res.json();
      setSchedule(updated);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-gray-100 rounded-lg h-96 animate-pulse" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="p-8">
        <Link
          href={`/${orgSlug}/on-call`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Schedules
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          Schedule not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${orgSlug}/on-call`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{schedule.name}</h1>
            <p className="text-gray-600 mt-1">Team: {schedule.team.name}</p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit size={20} />
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Schedule Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Schedule Name</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="mt-1 text-gray-900">{schedule.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Team</label>
            <p className="mt-1 text-gray-900">{schedule.team.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Rotation Type</label>
            <p className="mt-1 text-gray-900 capitalize">{schedule.rotationType.toLowerCase()}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Timezone</label>
            {isEditing ? (
              <select
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            ) : (
              <p className="mt-1 text-gray-900">{schedule.timezone}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Created</label>
            <p className="mt-1 text-gray-900">
              {new Date(schedule.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="pt-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              <Save size={20} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: schedule.name,
                  timezone: schedule.timezone,
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Rotations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Rotations</h2>

        {schedule.rotations.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No rotations configured</p>
          </div>
        ) : (
          <div className="space-y-2">
            {schedule.rotations.map((rotation) => (
              <div
                key={rotation.id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{rotation.user.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(rotation.startTime).toLocaleDateString()} -{' '}
                    {new Date(rotation.endTime).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {Math.ceil(
                    (new Date(rotation.endTime).getTime() -
                      new Date(rotation.startTime).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}{' '}
                  days
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
