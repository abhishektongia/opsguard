'use client';

import { useState } from 'react';
import { Trash2, Edit, Copy } from 'lucide-react';

interface NotificationRule {
  id: string;
  name: string;
  trigger: 'severity' | 'oncall';
  severities?: string[];
  channels: string[];
  delayMinutes: number;
  repeatMinutes: number;
  enabled: boolean;
  escalationSteps?: any[];
  createdAt: string;
}

interface NotificationRulesListProps {
  rules: NotificationRule[];
  onEdit?: (rule: NotificationRule) => void;
  onDelete?: (ruleId: string) => Promise<void>;
  onDuplicate?: (ruleId: string) => Promise<void>;
  onToggle?: (ruleId: string, enabled: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function NotificationRulesList({
  rules,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  isLoading,
}: NotificationRulesListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (ruleId: string) => {
    if (!window.confirm('Delete this notification rule?')) return;

    setDeleting(ruleId);
    try {
      await onDelete?.(ruleId);
    } finally {
      setDeleting(null);
    }
  };

  const channelIcons: Record<string, string> = {
    email: '📧',
    sms: '📱',
    phone: '☎️',
    slack: '💬',
    push: '🔔',
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No notification rules configured yet</p>
        <p className="text-sm text-gray-500 mt-1">Create your first rule to get notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {rule.trigger === 'severity' ? 'Severity' : 'On-Call'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {rule.trigger === 'severity' && rule.severities && (
                  <div className="flex gap-1">
                    {rule.severities.map((sev) => (
                      <span
                        key={sev}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                      >
                        {sev}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-1">
                  {rule.channels.map((channel) => (
                    <span
                      key={channel}
                      title={channel}
                      className="text-lg"
                    >
                      {channelIcons[channel] || '🔔'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-600 mt-2 space-y-1">
                <p>
                  Initial delay: <span className="font-mono font-bold">{rule.delayMinutes}m</span>
                  {rule.repeatMinutes > 0 && (
                    <>
                      , Repeat every: <span className="font-mono font-bold">{rule.repeatMinutes}m</span>
                    </>
                  )}
                </p>
                {rule.escalationSteps && rule.escalationSteps.length > 0 && (
                  <p>
                    Escalation steps:{' '}
                    <span className="font-bold">{rule.escalationSteps.length}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => onToggle?.(rule.id, !rule.enabled)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  rule.enabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rule.enabled ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={() => onEdit?.(rule)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={() => onDuplicate?.(rule.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              <Copy size={14} />
              Duplicate
            </button>
            <button
              onClick={() => handleDelete(rule.id)}
              disabled={deleting === rule.id}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 transition"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
