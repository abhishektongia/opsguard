'use client';

import { useState } from 'react';
import { formatDateTime, formatDuration } from '@/lib/utils/formatting';
import { SEVERITY_LEVELS, INCIDENT_STATUSES } from '@/lib/constants';
import { CheckCircle, MessageSquare, FileText } from 'lucide-react';

interface IncidentDetailProps {
  incident: any;
  orgSlug: string;
}

export function IncidentDetail({ incident, orgSlug }: IncidentDetailProps) {
  const [activeTab, setActiveTab] = useState<
    'timeline' | 'communication' | 'postmortem'
  >('timeline');
  const [newUpdate, setNewUpdate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const severity = SEVERITY_LEVELS[incident.severity];
  const statusConfig = INCIDENT_STATUSES[incident.status];

  const handlePostUpdate = async () => {
    if (!newUpdate.trim()) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/v1/incidents/${incident.id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newUpdate }),
      });

      if (res.ok) {
        setNewUpdate('');
        window.location.reload();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const timeline = Array.isArray(incident.timeline) ? incident.timeline : [];

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
              <h1 className="text-3xl font-bold text-gray-900">{incident.title}</h1>
              {incident.description && (
                <p className="text-gray-600 mt-2">{incident.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <select
              defaultValue={incident.status}
              onChange={(e) => console.log('Change status to', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
            >
              {Object.entries(INCIDENT_STATUSES).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Severity</p>
            <p className="font-bold mt-1">{incident.severity}</p>
          </div>
          <div>
            <p className="text-gray-500">Duration</p>
            <p className="font-bold mt-1">
              {formatDuration(incident.createdAt, incident.resolvedAt)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Responders</p>
            <p className="font-bold mt-1">
              {incident.responderIds?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Linked Alerts</p>
            <p className="font-bold mt-1">
              {incident.linkedAlertIds?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'timeline', label: 'Timeline', icon: MessageSquare },
            { id: 'communication', label: 'Communication', icon: FileText },
            { id: 'postmortem', label: 'Postmortem', icon: CheckCircle },
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
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Update
                </label>
                <textarea
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  placeholder="Post a status update or note..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={handlePostUpdate}
                  disabled={isUpdating || !newUpdate.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
                >
                  {isUpdating ? 'Posting...' : 'Post Update'}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h3>
                <div className="space-y-4">
                  {timeline.length === 0 ? (
                    <p className="text-gray-500 text-sm">No timeline events yet</p>
                  ) : (
                    timeline.map((entry: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-3 h-3 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {entry.message || entry.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(entry.timestamp)}
                          </p>
                          {entry.by && (
                            <p className="text-xs text-gray-400 mt-1">by {entry.by}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'communication' && (
            <p className="text-gray-500">
              Communication features coming soon
            </p>
          )}

          {activeTab === 'postmortem' && (
            <div>
              <textarea
                defaultValue={incident.postmortem || ''}
                placeholder="Write a postmortem for this incident..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                rows={10}
              />
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Postmortem
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
