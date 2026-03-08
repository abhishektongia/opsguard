'use client';

import { useState } from 'react';
import { formatDateTime, formatTimeAgo, formatDuration } from '@/lib/utils/formatting';
import { SEVERITY_LEVELS, ALERT_STATUSES } from '@/lib/constants';
import {
  CheckCircle,
  X,
  FileText,
  Clock,
  MessageSquare,
  Flame,
} from 'lucide-react';

interface AlertDetailProps {
  alert: any;
  orgSlug: string;
}

export function AlertDetail({ alert, orgSlug }: AlertDetailProps) {
  const [activeTab, setActiveTab] = useState<
    'details' | 'timeline' | 'activity' | 'related'
  >('details');
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  const severity = SEVERITY_LEVELS[alert.severity];
  const statusConfig = ALERT_STATUSES[alert.status];

  const handleAcknowledge = async () => {
    setIsAcknowledging(true);
    try {
      const res = await fetch(`/api/v1/alerts/${alert.id}/acknowledge`, {
        method: 'POST',
      });
      if (res.ok) {
        window.location.reload();
      }
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const res = await fetch(`/api/v1/alerts/${alert.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNote }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4 flex-1">
            <div
              className="w-4 h-4 rounded-full mt-1"
              style={{ backgroundColor: severity.color }}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{alert.title}</h1>
              <p className="text-gray-600 mt-2">{alert.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="px-4 py-2 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: statusConfig.color }}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-500 uppercase">Severity</p>
            <p className="text-lg font-bold mt-1">{alert.severity}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Source</p>
            <p className="text-lg font-bold mt-1">{alert.source}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Created</p>
            <p className="text-sm mt-1">{formatDateTime(alert.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Duration</p>
            <p className="text-sm mt-1">
              {alert.status === 'RESOLVED'
                ? formatDuration(alert.createdAt, alert.resolvedAt)
                : formatDuration(alert.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        {alert.status !== 'RESOLVED' && alert.status !== 'CLOSED' && (
          <div className="flex gap-2">
            {alert.status !== 'ACK' && (
              <button
                onClick={handleAcknowledge}
                disabled={isAcknowledging}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition disabled:opacity-50"
              >
                <CheckCircle size={16} />
                Acknowledge
              </button>
            )}
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
            >
              <CheckCircle size={16} />
              Resolve
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
              <X size={16} />
              Close
            </button>
          </div>
        )}
      </div>

      {/* Resolution Note (if resolving) */}
      {isResolving && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resolution Note
          </label>
          <textarea
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Describe how this alert was resolved..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows={4}
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleResolve}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Confirm Resolution
            </button>
            <button
              onClick={() => setIsResolving(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'details', label: 'Details', icon: FileText },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'activity', label: 'Activity', icon: MessageSquare },
            { id: 'related', label: 'Related Incidents', icon: Flame },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
                activeTab === id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-600">{alert.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </h3>
                <p className="text-gray-600">
                  {alert.assignedTo?.name || 'Unassigned'}
                </p>
              </div>

              {alert.assignedTeam && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Team
                  </h3>
                  <p className="text-gray-600">{alert.assignedTeam.name}</p>
                </div>
              )}

              {alert.tags && alert.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {alert.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {alert.rawPayload && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Raw Payload
                  </h3>
                  <pre className="bg-gray-50 p-4 rounded border border-gray-200 text-xs overflow-x-auto">
                    {JSON.stringify(alert.rawPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-600 mt-2" />
                <div>
                  <p className="font-medium text-gray-900">Alert created</p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(alert.createdAt)}
                  </p>
                </div>
              </div>

              {alert.ackedAt && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mt-2" />
                  <div>
                    <p className="font-medium text-gray-900">Alert acknowledged</p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(alert.ackedAt)}
                    </p>
                  </div>
                </div>
              )}

              {alert.resolvedAt && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-600 mt-2" />
                  <div>
                    <p className="font-medium text-gray-900">Alert resolved</p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(alert.resolvedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <p className="text-gray-500">No activity yet</p>
          )}

          {activeTab === 'related' && (
            <p className="text-gray-500">No related incidents</p>
          )}
        </div>
      </div>
    </div>
  );
}
