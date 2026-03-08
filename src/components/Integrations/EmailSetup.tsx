'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Copy, Mail } from 'lucide-react';

interface EmailSetupProps {
  orgSlug: string;
  integrationId?: string;
  isConnected?: boolean;
  emailAddress?: string;
  onSuccess?: () => void;
}

export function EmailSetup({
  orgSlug,
  integrationId,
  isConnected,
  emailAddress: initialEmail,
  onSuccess,
}: EmailSetupProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState({
    server: '',
    port: 587,
    username: '',
    password: '',
    fromEmail: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const emailAddress = initialEmail || `alerts@${orgSlug}.opsguard.com`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSMTP = async () => {
    setError(null);

    if (!smtpConfig.server || !smtpConfig.username || !smtpConfig.password) {
      setError('Please fill in all SMTP fields');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/integrations/${integrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { smtpConfig },
          enabled: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save SMTP configuration');
      }

      onSuccess?.();
      setShowAdvanced(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Integration</h3>
        <p className="text-sm text-gray-600">Send alerts to OpsGuard via email</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
        <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-green-900">
          <p className="font-medium">Email ingestion is ready to use</p>
          <p className="mt-1">Forward alerts from any email source to the address below</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Email Address for Alerts</label>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono flex items-center gap-2">
            <Mail size={16} className="text-gray-500" />
            {emailAddress}
          </div>
          <button
            onClick={handleCopyEmail}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium text-sm"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900">How to use:</h4>
        <ol className="text-sm text-blue-900 space-y-2 list-decimal list-inside">
          <li>Configure your monitoring tool to send alert emails to the address above</li>
          <li>Email format: Subject becomes alert title, body becomes description</li>
          <li>Severity auto-detection: Use keywords like CRITICAL, ERROR, WARNING, INFO in subject</li>
          <li>Attachments are stored as alert evidence</li>
          <li>Automated rules will process incoming emails and notify responders</li>
        </ol>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {showAdvanced ? '− Hide' : '+ Show'} Advanced SMTP Settings
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              Configure SMTP to receive alerts directly from your email server (optional)
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
              <input
                type="text"
                value={smtpConfig.server}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, server: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input
                  type="number"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <input
                  type="email"
                  value={smtpConfig.fromEmail}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                  placeholder="noreply@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={smtpConfig.username}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                placeholder="your-email@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={smtpConfig.password}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <button
              onClick={handleSaveSMTP}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium text-sm"
            >
              {isSaving ? 'Saving...' : 'Save SMTP Configuration'}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          Email addresses are verified and encrypted. Only verified senders can create alerts to
          prevent spam.
        </p>
      </div>
    </div>
  );
}
