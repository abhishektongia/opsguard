'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Unlink } from 'lucide-react';

interface SlackSetupProps {
  orgSlug: string;
  integrationId?: string;
  isConnected?: boolean;
  onSuccess?: () => void;
}

export function SlackSetup({ orgSlug, integrationId, isConnected, onSuccess }: SlackSetupProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<Record<string, string>>({
    P1: '#critical',
    P2: '#warnings',
    P3: '#alerts',
    P4: '#info',
    P5: '#debug',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleConnect = async () => {
    setStatus('connecting');
    setError(null);

    try {
      // Generate OAuth request to Slack
      const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
      if (!clientId) {
        throw new Error('Slack OAuth not configured');
      }

      const redirectUri = `${window.location.origin}/${orgSlug}/integrations/slack/callback`;
      const scope = 'chat:write,channels:read,groups:read';
      const state = btoa(JSON.stringify({ orgSlug, integrationId }));

      const slackUrl = new URL('https://slack.com/oauth/v2/authorize');
      slackUrl.searchParams.set('client_id', clientId);
      slackUrl.searchParams.set('scope', scope);
      slackUrl.searchParams.set('redirect_uri', redirectUri);
      slackUrl.searchParams.set('state', state);

      window.location.href = slackUrl.toString();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to initiate Slack connection');
    }
  };

  const handleSaveChannels = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/integrations/${integrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { channelMapping: selectedChannels },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save channel mapping');
      }

      setStatus('success');
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save channels');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Slack integration? Alerts will no longer be sent to Slack.')) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/integrations/${integrationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to disconnect');
      }

      setStatus('idle');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Slack Integration</h3>
        <p className="text-sm text-gray-600">
          Receive alerts directly in your Slack workspace
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {!isConnected ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              Click the button below to authorize OpsGuard to post alerts to your Slack workspace.
              You'll be asked to select which workspace and channels to use.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={status === 'connecting'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium"
          >
            {status === 'connecting' && <Loader2 size={18} className="animate-spin" />}
            {status === 'connecting' ? 'Connecting...' : 'Connect to Slack'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-medium">Slack workspace connected successfully</p>
              <p className="mt-1">Configure which channel receives alerts by severity</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Channel Mapping by Severity</h4>
            {['P1', 'P2', 'P3', 'P4', 'P5'].map((severity) => (
              <div key={severity} className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-12">{severity}:</label>
                <input
                  type="text"
                  value={selectedChannels[severity] || ''}
                  onChange={(e) =>
                    setSelectedChannels({
                      ...selectedChannels,
                      [severity]: e.target.value,
                    })
                  }
                  placeholder="#channel-name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Or use same channel for all:</h4>
            <input
              type="text"
              placeholder="#alerts"
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedChannels({
                    P1: e.target.value,
                    P2: e.target.value,
                    P3: e.target.value,
                    P4: e.target.value,
                    P5: e.target.value,
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveChannels}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium text-sm"
            >
              {isSaving ? 'Saving...' : 'Save Channel Mapping'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm flex items-center gap-2"
            >
              <Unlink size={16} />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
