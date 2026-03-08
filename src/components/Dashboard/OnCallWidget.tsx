'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils/formatting';

interface OnCallPerson {
  name: string;
  team: string;
  shiftEndsAt: Date;
}

interface OnCallWidgetProps {
  onCallPeople: OnCallPerson[];
  orgSlug: string;
}

export function OnCallWidget({ onCallPeople, orgSlug }: OnCallWidgetProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock size={20} />
          Who's On-Call
        </h2>
        <Link
          href={`/${orgSlug}/on-call`}
          className="text-sm text-blue-600 hover:underline"
        >
          Manage schedules
        </Link>
      </div>

      {onCallPeople.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          No on-call schedules configured
        </p>
      ) : (
        <div className="space-y-4">
          {onCallPeople.map((person, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {person.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{person.name}</p>
                  <p className="text-xs text-gray-500">{person.team}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Shift ends in</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatTimeAgo(person.shiftEndsAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
