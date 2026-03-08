'use client';

import { ExternalLink, Settings, Trash2 } from 'lucide-react';

interface IntegrationCardProps {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  orgSlug: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
}

const getIntegrationIcon = (type: string) => {
  const icons: Record<string, string> = {
    SLACK: '💬',
    MSTEAMS: '👥',
    DATADOG: '📊',
    GRAFANA: '📈',
    PROMETHEUS: '🔍',
    EMAIL: '📧',
    PAGERDUTY: '🚨',
    JIRA: '🔗',
    SERVICENOW: '🎫',
    GITHUB: '🐙',
    JENKINS: '⚙️',
    CUSTOM: '🔌',
  };
  return icons[type] || '🔌';
};

export function IntegrationCard({
  id,
  type,
  name,
  description,
  enabled,
  orgSlug,
  onEdit,
  onDelete,
}: IntegrationCardProps) {
  const handleDelete = async () => {
    if (window.confirm(`Delete "${name}" integration?`)) {
      await onDelete?.(id);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <span className="text-4xl">{getIntegrationIcon(type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            enabled
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {enabled ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={() => onEdit?.(id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
        >
          <Settings size={16} />
          Configure
        </button>
        <button
          onClick={handleDelete}
          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
