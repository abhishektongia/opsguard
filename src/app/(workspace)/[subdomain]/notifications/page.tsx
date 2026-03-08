'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Bell, History } from 'lucide-react';
import { NotificationRuleBuilder } from '@/components/Notifications/NotificationRuleBuilder';
import { NotificationRulesList } from '@/components/Notifications/NotificationRulesList';
import { NotificationLogs } from '@/components/Notifications/NotificationLogs';

interface NotificationRule {
  id: string;
  name: string;
  trigger: 'severity' | 'oncall';
  severities?: string[];
  channels: string[];
  delayMinutes: number;
  repeatInterval: number;
  enabled: boolean;
  escalationPolicy?: string;
  createdAt: string;
}

interface NotificationLog {
  id: string;
  alertId: string;
  alertTitle: string;
  userId?: string;
  userName?: string;
  channel: 'email' | 'sms' | 'phone' | 'slack' | 'push';
  status: 'sent' | 'failed' | 'bounced' | 'pending';
  sentAt: string;
  deliveryTimestamp?: string;
  errorMessage?: string;
}

export default function NotificationsPage() {
  const params = useParams();
  const orgSlug = params.subdomain as string;

  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'logs'>('rules');
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rulesRes, logsRes, usersRes, teamsRes] = await Promise.all([
        fetch('/api/v1/notifications/rules'),
        fetch('/api/v1/notifications/logs'),
        fetch('/api/v1/users'),
        fetch('/api/v1/teams'),
      ]);

      if (!rulesRes.ok || !logsRes.ok || !usersRes.ok || !teamsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const rulesData = await rulesRes.json();
      const logsData = await logsRes.json();
      const usersData = await usersRes.json();
      const teamsData = await teamsRes.json();

      setRules(
        rulesData.map((rule: any) => ({
          ...rule,
          channels: rule.channels ? rule.channels.split(',') : [],
          severities: rule.alertSeverity ? rule.alertSeverity.split(',') : [],
          repeatMinutes: rule.repeatInterval || 0,
        })),
      );
      setLogs(logsData.logs || []);
      setUsers(usersData);
      setTeams(teamsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (rule: any) => {
    try {
      const res = await fetch('/api/v1/notifications/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });

      if (!res.ok) {
        throw new Error('Failed to create rule');
      }

      setShowBuilder(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/v1/notifications/rules/${ruleId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete rule');
      }

      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule');
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/v1/notifications/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) {
        throw new Error('Failed to update rule');
      }

      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rule');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Configure how and when you receive alerts
          </p>
        </div>
        {activeTab === 'rules' && !showBuilder && (
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            New Rule
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('rules');
            setShowBuilder(false);
          }}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition border-b-2 ${
            activeTab === 'rules'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <Bell size={18} />
          Rules
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs ml-1">
            {rules.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition border-b-2 ${
            activeTab === 'logs'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <History size={18} />
          Activity Log
        </button>
      </div>

      {/* Content */}
      {showBuilder ? (
        <NotificationRuleBuilder
          users={users}
          teams={teams}
          onSave={handleCreateRule}
          isLoading={loading}
        />
      ) : activeTab === 'rules' ? (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
            <p className="font-medium mb-2">How Notification Rules Work:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Rules are triggered by alert severity or when you&apos;re on-call</li>
              <li>Notifications are sent via selected channels in priority order (email → SMS → phone → Slack → push)</li>
              <li>You can add escalation steps to notify managers if you don&apos;t acknowledge</li>
              <li>Rules are applied per organization - all team members get their own notification rules</li>
            </ul>
          </div>

          <NotificationRulesList
            rules={rules}
            onDelete={handleDeleteRule}
            onToggle={handleToggleRule}
            isLoading={loading}
          />
        </div>
      ) : (
        <NotificationLogs logs={logs} isLoading={loading} />
      )}
    </div>
  );
}
