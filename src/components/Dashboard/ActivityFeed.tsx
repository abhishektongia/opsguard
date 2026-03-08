'use client';

import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils/formatting';
import { Bell, CheckCircle, AlertCircle, Flame } from 'lucide-react';

interface Activity {
  id: string;
  type: 'alert_created' | 'alert_acked' | 'alert_resolved' | 'incident_created' | 'incident_updated';
  title: string;
  description: string;
  resourceId: string;
  resourceType: 'alert' | 'incident';
  timestamp: Date;
  userName: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  orgSlug: string;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'alert_created':
      return <Bell className="w-4 h-4" />;
    case 'alert_acked':
      return <CheckCircle className="w-4 h-4 text-yellow-500" />;
    case 'alert_resolved':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'incident_created':
      return <Flame className="w-4 h-4 text-red-500" />;
    case 'incident_updated':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'alert_created':
      return 'bg-blue-50 border-blue-200';
    case 'alert_acked':
      return 'bg-yellow-50 border-yellow-200';
    case 'alert_resolved':
      return 'bg-green-50 border-green-200';
    case 'incident_created':
      return 'bg-red-50 border-red-200';
    case 'incident_updated':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export function ActivityFeed({ activities, orgSlug }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <p className="text-gray-500 text-sm py-8 text-center">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Link
          href={`/${orgSlug}/alerts`}
          className="text-sm text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href={`/${orgSlug}/${activity.resourceType}s/${activity.resourceId}`}
            className={`flex items-start gap-4 p-4 border rounded-lg transition hover:shadow-sm ${getActivityColor(activity.type)}`}
          >
            <div className="flex-shrink-0 mt-1 text-gray-600">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                </div>
                <p className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">by {activity.userName}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
