'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Copy, Unlink } from 'lucide-react';

interface MSTeamsSetupProps {
  orgSlug: string;
  integrationId?: string;
  isConnected?: boolean;
  webhookUrl?: string;
  onSuccess?: () => void;
}

export function MSTeamsSetup({
  orgSlug,
  integrationId,
  isConnected,
  webhookUrl: initialWebhookUrl,
  onSuccess,
}: MSTeamsSetupProps) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl || '');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleSave = async () => {
    setError(null);

    if (!webhookUrl.trim()) {
      setError('Webhook URL is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/integrations/${integrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { webhookUrl },
          enabled: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save webhook URL');
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setError(null);
    setTestSuccess(false);
    setIsTesting(true);

    try {
      const res = await fetch(`/api/v1/integrations/${integrationId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'msteams',
          payload: {
            title: 'Test Alert from OpsGuard',
            severity: 'P2',
            description: 'This is a test alert to verify Microsoft Teams integration',
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Test failed - check webhook URL');
      }

      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test alert');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Microsoft Teams integration? Alerts will no longer be sent.')) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/integrations/${integrationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to disconnect');
      }

      setWebhookUrl('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  const handleCopy = () => {
    const text = `Webhook URL: ${webhookUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Microsoft Teams Integration</h3>
        <p className="text-sm text-gray-600">Receive alerts in Microsoft Teams channels via webhooks</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {testSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3 text-green-700">
          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">Test alert sent successfully!</div>
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
        <p className="text-sm text-blue-900 font-medium">Setup Instructions:</p>
        <ol className="text-sm text-blue-900 space-y-2 list-decimal list-inside">
          <li>Go to Microsoft Teams and choose a channel to receive alerts</li>
          <li>Click "..." (More options) → Connectors → Configure</li>
          <li>Search for "Incoming Webhook" and configure it</li>
          <li>Give it a name like "OpsGuard Alerts" and optionally upload an image</li>
          <li>Copy the webhook URL from Teams and paste it below</li>
          <li>Click "Save" to verify the connection</li>
        </ol>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
        <div className="flex gap-2">
          <input
            type="password"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://outlook.webhook.office.com/webhookb2/..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          />
          {webhookUrl && (
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          Your webhook URL is encrypted and never shared. You can create multiple webhooks for
          different channels if needed.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleTest}
          disabled={!webhookUrl || isTesting}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition font-medium text-sm"
        >
          {isTesting ? 'Sending...' : 'Send Test Alert'}
        </button>
        <button
          onClick={handleSave}
          disabled={!webhookUrl || isSaving}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium text-sm"
        >
          {isSaving ? 'Saving...' : 'Save & Enable'}
        </button>
      </div>

      {isConnected && (
        <button
          onClick={handleDisconnect}
          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm flex items-center justify-center gap-2"
        >
          <Unlink size={16} />
          Disconnect
        </button>
      )}
    </div>
  );
}
