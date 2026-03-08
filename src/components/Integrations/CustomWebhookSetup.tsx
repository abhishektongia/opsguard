'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';

interface CustomWebhookSetupProps {
  orgSlug: string;
  integrationId?: string;
  isConnected?: boolean;
  onSuccess?: () => void;
}

export function CustomWebhookSetup({
  orgSlug,
  integrationId,
  isConnected,
  onSuccess,
}: CustomWebhookSetupProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState('generic');
  const [fieldMapping, setFieldMapping] = useState({
    title: '',
    description: '',
    severity: '',
    source: '',
    tags: '',
  });
  const [testPayload, setTestPayload] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const webhookUrl = `${window.location.origin}/api/v1/webhooks/${integrationId}`;

  const templates = {
    generic: {
      name: 'Generic Webhook',
      sample: JSON.stringify(
        {
          alert_title: 'Example Alert',
          alert_description: 'This is an example alert',
          severity_level: 'high',
          source_system: 'custom-monitor',
        },
        null,
        2
      ),
    },
    pagerduty: {
      name: 'PagerDuty',
      sample: JSON.stringify(
        {
          routing_key: 'xxx',
          event_action: 'trigger',
          dedup_key: 'baf3b3eb5db67873c00000000307d2e1',
          payload: {
            summary: 'server is on fire',
            severity: 'critical',
            source: 'Production Server',
          },
        },
        null,
        2
      ),
    },
    jira: {
      name: 'Jira Webhook',
      sample: JSON.stringify(
        {
          webhookEvent: 'issue_created',
          issue: {
            key: 'PROJ-123',
            fields: {
              summary: 'Alert: High CPU usage',
              description: 'CPU exceeded threshold',
              priority: { name: 'Critical' },
            },
          },
        },
        null,
        2
      ),
    },
  };

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

    const hasMapping = Object.values(fieldMapping).some((v) => v);
    if (!hasMapping) {
      setError('Please define at least one field mapping');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/integrations/${integrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { fieldMapping, template },
          enabled: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save field mapping');
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Webhook Integration</h3>
        <p className="text-sm text-gray-600">Receive alerts from any custom system via webhook</p>
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
        <p className="text-xs text-gray-600 mb-2">
          POST your alert payload to this URL. The webhook will parse and create an alert in
          OpsGuard.
        </p>
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
        <h4 className="font-medium text-gray-900 mb-3">Template</h4>
        <p className="text-sm text-gray-600 mb-3">Select a template or start with generic:</p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(templates).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setTemplate(key);
                setTestPayload(value.sample);
              }}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                template === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {value.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Field Mapping</h4>
        <p className="text-sm text-gray-600 mb-4">
          Map JSON fields from your payload to OpsGuard using JSONPath (e.g., alert.title or
          payload[0].summary):
        </p>

        <div className="space-y-3">
          {[
            {
              key: 'title',
              label: 'Alert Title',
              placeholder: 'alert.title or payload.summary',
            },
            {
              key: 'description',
              label: 'Description',
              placeholder: 'alert.description or payload.details',
            },
            {
              key: 'severity',
              label: 'Severity',
              placeholder: 'alert.severity or level or priority',
            },
            {
              key: 'source',
              label: 'Source System',
              placeholder: 'source or integration_name',
            },
            { key: 'tags', label: 'Tags (comma-separated)', placeholder: 'tags or labels' },
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
          disabled={isSaving}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium text-sm"
        >
          {isSaving ? 'Saving...' : 'Save Field Mapping'}
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-3">Test Webhook</h4>
        <p className="text-sm text-gray-600 mb-3">
          Paste a sample payload to test the field mapping and webhook:
        </p>

        <textarea
          value={testPayload}
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

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
        <p className="text-xs font-medium text-gray-900">Severity Auto-Detection:</p>
        <p className="text-xs text-gray-600">
          If severity field is empty or value unrecognized, OpsGuard auto-detects from keywords:
          CRITICAL/HIGH/ERROR → P1, WARNING → P2, INFO → P3, DEBUG → P4, OTHER → P5
        </p>
      </div>
    </div>
  );
}
