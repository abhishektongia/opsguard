'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';

interface MonitoringSetupProps {
  orgSlug: string;
  integrationId?: string;
  type: 'datadog' | 'grafana' | 'prometheus';
  isConnected?: boolean;
  onSuccess?: () => void;
}

export function MonitoringSetup({
  orgSlug,
  integrationId,
  type,
  isConnected,
  onSuccess,
}: MonitoringSetupProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldMapping, setFieldMapping] = useState({
    title: 'alert.title',
    description: 'alert.description',
    severity: 'alert.severity',
    source: 'alert.source',
  });
  const [testPayload, setTestPayload] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const webhookUrl = `${window.location.origin}/api/v1/webhooks/${integrationId}`;

  const typeConfig = {
    datadog: {
      name: 'Datadog',
      description: 'Receive alerts from Datadog monitors',
      setup: 'Configure a webhook notification in your Datadog monitors settings',
      samplePayload: JSON.stringify(
        {
          alert: {
            title: 'High CPU Usage',
            description: 'CPU usage exceeded 90% threshold',
            severity: 'critical',
            source: 'datadog',
            host: 'server-01',
            tags: ['environment:prod', 'service:api'],
          },
        },
        null,
        2
      ),
    },
    grafana: {
      name: 'Grafana',
      description: 'Receive alerts from Grafana alert rules',
      setup: 'Add webhook notification channel in Grafana alerting settings',
      samplePayload: JSON.stringify(
        {
          alerts: [
            {
              status: 'firing',
              labels: {
                alertname: 'HighErrorRate',
                severity: 'critical',
              },
              annotations: {
                summary: 'High error rate detected',
                description: 'Error rate has exceeded the threshold',
              },
            },
          ],
        },
        null,
        2
      ),
    },
    prometheus: {
      name: 'Prometheus',
      description: 'Receive alerts from Prometheus AlertManager',
      setup: 'Configure webhook_configs in your AlertManager configuration',
      samplePayload: JSON.stringify(
        {
          alerts: [
            {
              status: 'firing',
              labels: {
                alertname: 'NodeDown',
                severity: 'warning',
              },
              annotations: {
                summary: 'Node is down',
                description: 'Node server-prod-01 is unreachable',
              },
            },
          ],
        },
        null,
        2
      ),
    },
  };

  const config = typeConfig[type];

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = async () => {
    setError(null);
    setTestSuccess(false);

    if (!testPayload.trim()) {
      setError('Please enter a test payload');
      return;
    }

    setIsTesting(true);
    try {
      let payload;
      try {
        payload = JSON.parse(testPayload);
      } catch {
        throw new Error('Invalid JSON in test payload');
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Webhook test failed');
      }

      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test alert');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveMapping = async () => {
    setError(null);

    try {
      const res = await fetch(`/api/v1/integrations/${integrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { fieldMapping },
          enabled: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save field mapping');
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{config.name} Integration</h3>
        <p className="text-sm text-gray-600">{config.description}</p>
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
          <div className="text-sm">Test alert received successfully!</div>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
        <p className="text-xs text-gray-600 mb-2">{config.setup}</p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            {copied ? 'Copied!' : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Field Mapping</h4>
        <p className="text-sm text-gray-600 mb-4">
          Map fields from your {config.name} payload to OpsGuard fields using JSON path:
        </p>

        <div className="space-y-3">
          {[
            { key: 'title', label: 'Alert Title', placeholder: 'alert.title' },
            {
              key: 'description',
              label: 'Description',
              placeholder: 'alert.description',
            },
            { key: 'severity', label: 'Severity', placeholder: 'alert.severity' },
            { key: 'source', label: 'Source', placeholder: 'alert.source' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                value={fieldMapping[field.key as keyof typeof fieldMapping]}
                onChange={(e) =>
                  setFieldMapping({
                    ...fieldMapping,
                    [field.key]: e.target.value,
                  })
                }
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveMapping}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
        >
          Save Field Mapping
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-3">Test Webhook</h4>
        <p className="text-sm text-gray-600 mb-3">
          Paste a sample payload from {config.name} to test the webhook:
        </p>

        <textarea
          value={testPayload || config.samplePayload}
          onChange={(e) => setTestPayload(e.target.value)}
          placeholder="Paste JSON payload here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono h-32 mb-3"
        />

        <button
          onClick={handleTest}
          disabled={isTesting}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition font-medium text-sm"
        >
          {isTesting ? 'Testing...' : 'Send Test Alert'}
        </button>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          Your webhook URL is unique per organization and integration. Keep it secret like an API
          key.
        </p>
      </div>
    </div>
  );
}
