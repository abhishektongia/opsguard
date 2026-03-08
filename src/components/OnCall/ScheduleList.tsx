'use client';

import Link from 'next/link';
import { Calendar, Edit2, Trash2, Clock } from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  team: {
    name: string;
  };
  rotationType: string;
  timezone: string;
  rotations?: any[];
}

interface ScheduleListProps {
  schedules: Schedule[];
  orgSlug: string;
  isLoading?: boolean;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export function ScheduleList({
  schedules,
  orgSlug,
  isLoading,
  onDelete,
  onRefresh,
}: ScheduleListProps) {
  const getCurrentOnCall = (schedule: Schedule) => {
    if (!schedule.rotations || schedule.rotations.length === 0) {
      return null;
    }

    const now = new Date();
    const current = schedule.rotations.find(
      (rotation) =>
        new Date(rotation.startTime) <= now &&
        new Date(rotation.endTime) >= now,
    );

    return current?.user;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No schedules yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Create a schedule to manage on-call rotations
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {schedules.map((schedule) => {
        const currentOnCall = getCurrentOnCall(schedule);

        return (
          <div
            key={schedule.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {schedule.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Team: {schedule.team.name}
              </p>
            </div>

            <div className="space-y-3 mb-4 pb-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rotation Type</span>
                <span className="font-semibold capitalize">
                  {schedule.rotationType.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Timezone</span>
                <span className="font-semibold">{schedule.timezone}</span>
              </div>

              {currentOnCall && (
                <div className="flex items-start gap-2 text-sm bg-blue-50 p-3 rounded">
                  <Clock size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-600 font-semibold">ON-CALL NOW</p>
                    <p className="text-gray-900 font-medium">
                      {currentOnCall.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/${orgSlug}/on-call/${schedule.id}`}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium text-center"
              >
                Edit
              </Link>
              <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete?.(schedule.id)}
                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
