'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface EscalationStep {
  id: string;
  delayMinutes: number;
  targetUserId?: string;
  targetTeamId?: string;
  targetType: 'user' | 'team';
}

interface NotificationRuleBuilderProps {
  users: any[];
  teams: any[];
  onSave?: (rule: any) => Promise<void>;
  isLoading?: boolean;
}

export function NotificationRuleBuilder({
  users,
  teams,
  onSave,
  isLoading,
}: NotificationRuleBuilderProps) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<'severity' | 'oncall'>('severity');
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    phone: false,
    slack: false,
    push: false,
  });
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [repeatMinutes, setRepeatMinutes] = useState(0);
  const [escalationSteps, setEscalationSteps] = useState<EscalationStep[]>([]);
  const [newEscalation, setNewEscalation] = useState<Partial<EscalationStep>>({
    targetType: 'user',
    delayMinutes: 15,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const severities = ['P1', 'P2', 'P3', 'P4', 'P5'];

  const handleAddEscalation = () => {
    if (!newEscalation.delayMinutes || (!newEscalation.targetUserId && !newEscalation.targetTeamId)) {
      setError('Please select both delay and target for escalation');
      return;
    }

    setEscalationSteps([
      ...escalationSteps,
      {
        id: Date.now().toString(),
        ...(newEscalation as any),
      },
    ]);
    setNewEscalation({ targetType: 'user', delayMinutes: 15 });
    setError(null);
  };

  const handleRemoveEscalation = (id: string) => {
    setEscalationSteps(escalationSteps.filter((e) => e.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Rule name is required');
      return;
    }

    if (trigger === 'severity' && selectedSeverities.length === 0) {
      setError('Please select at least one severity level');
      return;
    }

    const enabledChannels = Object.entries(channels)
      .filter(([_, enabled]) => enabled)
      .map(([channel]) => channel);

    if (enabledChannels.length === 0) {
      setError('Please select at least one notification channel');
      return;
    }

    setIsSaving(true);
    try {
      const rule = {
        name,
        trigger,
        severities: trigger === 'severity' ? selectedSeverities : undefined,
        channels: enabledChannels,
        delayMinutes,
        repeatMinutes,
        escalationSteps,
      };

      await onSave?.(rule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Notification Rule</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Rule Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Critical Alerts - Notify DevOps"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Trigger Type */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">When to Trigger</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="trigger"
                value="severity"
                checked={trigger === 'severity'}
                onChange={(e) => setTrigger(e.target.value as any)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Alert Severity (select below)</span>
            </label>

            {trigger === 'severity' && (
              <div className="ml-7 flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                {severities.map((severity) => (
                  <button
                    key={severity}
                    type="button"
                    onClick={() => {
                      setSelectedSeverities(
                        selectedSeverities.includes(severity)
                          ? selectedSeverities.filter((s) => s !== severity)
                          : [...selectedSeverities, severity],
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      selectedSeverities.includes(severity)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input
                type="radio"
                name="trigger"
                value="oncall"
                checked={trigger === 'oncall'}
                onChange={(e) => setTrigger(e.target.value as any)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">When I&apos;m On-Call</span>
            </label>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Notification Channels (Priority Order)</h3>
          <p className="text-sm text-gray-600 mb-3">Channels are notified in order listed</p>

          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            {[
              { key: 'email', label: 'Email', icon: '📧' },
              { key: 'sms', label: 'SMS Text Message', icon: '📱' },
              { key: 'phone', label: 'Phone Call', icon: '☎️' },
              { key: 'slack', label: 'Slack Direct Message', icon: '💬' },
              { key: 'push', label: 'Push Notification', icon: '🔔' },
            ].map(({ key, label, icon }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded">
                <input
                  type="checkbox"
                  checked={channels[key as keyof typeof channels]}
                  onChange={(e) =>
                    setChannels({
                      ...channels,
                      [key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Timing */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Notification Timing</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Delay (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="1440"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">0 = notify immediately</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat Every (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="1440"
                value={repeatMinutes}
                onChange={(e) => setRepeatMinutes(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">0 = send once only</p>
            </div>
          </div>
        </div>

        {/* Escalation */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Escalation Steps (Optional)</h3>

          <div className="space-y-3 p-3 bg-gray-50 rounded-lg mb-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Escalate After (min)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newEscalation.delayMinutes || ''}
                  onChange={(e) =>
                    setNewEscalation({
                      ...newEscalation,
                      delayMinutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
                <select
                  value={newEscalation.targetType || 'user'}
                  onChange={(e) =>
                    setNewEscalation({
                      ...newEscalation,
                      targetType: e.target.value as any,
                      targetUserId: undefined,
                      targetTeamId: undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="user">User</option>
                  <option value="team">Team</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newEscalation.targetType === 'user' ? 'User' : 'Team'}
                </label>
                <select
                  value={
                    newEscalation.targetType === 'user'
                      ? newEscalation.targetUserId || ''
                      : newEscalation.targetTeamId || ''
                  }
                  onChange={(e) => {
                    if (newEscalation.targetType === 'user') {
                      setNewEscalation({ ...newEscalation, targetUserId: e.target.value });
                    } else {
                      setNewEscalation({ ...newEscalation, targetTeamId: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select...</option>
                  {newEscalation.targetType === 'user' ? (
                    users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))
                  ) : (
                    teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddEscalation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium text-sm"
            >
              <Plus size={16} />
              Add Escalation Step
            </button>
          </div>

          {escalationSteps.length > 0 && (
            <div className="space-y-2">
              {escalationSteps.map((step) => {
                const targetName =
                  step.targetType === 'user'
                    ? users.find((u) => u.id === step.targetUserId)?.name
                    : teams.find((t) => t.id === step.targetTeamId)?.name;

                return (
                  <div
                    key={step.id}
                    className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                  >
                    <p className="text-sm text-gray-700">
                      After {step.delayMinutes} min, notify {targetName}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveEscalation(step.id)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium"
          >
            {isSaving ? 'Creating...' : 'Create Rule'}
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
