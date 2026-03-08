'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Settings } from 'lucide-react';
import { IntegrationCard } from '@/components/Integrations/IntegrationCard';

interface Integration {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: 'communication' | 'monitoring' | 'itsm' | 'ci-cd' | 'custom';
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    type: 'SLACK',
    name: 'Slack',
    description: 'Send alerts to Slack channels via webhooks',
    icon: '💬',
    enabled: false,
    category: 'communication',
  },
  {
    id: 'msteams',
    type: 'MSTEAMS',
    name: 'Microsoft Teams',
    description: 'Receive alerts in Microsoft Teams channels',
    icon: '👥',
    enabled: false,
    category: 'communication',
  },
  {
    id: 'pagerduty',
    type: 'PAGERDUTY',
    name: 'PagerDuty',
    description: 'Integrate with PagerDuty for incident management',
    icon: '🚨',
    enabled: false,
    category: 'itsm',
  },
  {
    id: 'datadog',
    type: 'DATADOG',
    name: 'Datadog',
    description: 'Ingest alerts from Datadog monitors',
    icon: '📊',
    enabled: false,
    category: 'monitoring',
  },
  {
    id: 'grafana',
    type: 'GRAFANA',
    name: 'Grafana',
    description: 'Receive alerts from Grafana alert rules',
    icon: '📈',
    enabled: false,
    category: 'monitoring',
  },
  {
    id: 'prometheus',
    type: 'PROMETHEUS',
    name: 'Prometheus',
    description: 'Integrate with Prometheus AlertManager',
    icon: '🔍',
    enabled: false,
    category: 'monitoring',
  },
  {
    id: 'email',
    type: 'EMAIL',
    name: 'Email',
    description: 'Forward alerts via email',
    icon: '📧',
    enabled: false,
    category: 'communication',
  },
  {
    id: 'jira',
    type: 'JIRA',
    name: 'Jira',
    description: 'Create Jira issues from alerts',
    icon: '🔗',
    enabled: false,
    category: 'itsm',
  },
  {
    id: 'servicenow',
    type: 'SERVICENOW',
    name: 'ServiceNow',
    description: 'Sync incidents with ServiceNow',
    icon: '🎫',
    enabled: false,
    category: 'itsm',
  },
  {
    id: 'github',
    type: 'GITHUB',
    name: 'GitHub',
    description: 'Create GitHub issues from alerts',
    icon: '🐙',
    enabled: false,
    category: 'ci-cd',
  },
  {
    id: 'jenkins',
    type: 'JENKINS',
    name: 'Jenkins',
    description: 'Trigger Jenkins pipelines from alerts',
    icon: '⚙️',
    enabled: false,
    category: 'ci-cd',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Integrations' },
  { id: 'communication', label: 'Communication' },
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'itsm', label: 'ITSM & Ticketing' },
  { id: 'ci-cd', label: 'CI/CD' },
];

export default function IntegrationsPage() {
  const params = useParams();
  const orgSlug = params.subdomain as string;

  const [integrations, setIntegrations] = useState<Integration[]>(AVAILABLE_INTEGRATIONS);
  const [configuredIntegrations, setConfiguredIntegrations] = useState<
    Record<string, Integration>
  >({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupModal, setSetupModal] = useState<{ type: string; id: string } | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/integrations');

      if (!res.ok) {
        throw new Error('Failed to fetch integrations');
      }

      const data = await res.json();

      // Map configured integrations
      const configured: Record<string, Integration> = {};
      data.forEach((integration: any) => {
        configured[integration.type] = {
          id: integration.id,
          type: integration.type,
          name: integration.name,
          description: integration.description,
          icon: integration.icon || '',
          enabled: integration.enabled,
          category: integration.category || 'custom',
        };
      });

      setConfiguredIntegrations(configured);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const filteredIntegrations =
    selectedCategory === 'all'
      ? integrations
      : integrations.filter((int) => int.category === selectedCategory);

  const handleEdit = (integrationId: string) => {
    const integration = AVAILABLE_INTEGRATIONS.find((i) => i.id === integrationId);
    if (integration) {
      setSetupModal({ type: integration.type, id: integrationId });
    }
  };

  const handleDelete = async (integrationId: string) => {
    try {
      const res = await fetch(`/api/v1/integrations/${integrationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete integration');
      }

      setConfiguredIntegrations((prev) => {
        const updated = { ...prev };
        delete updated[integrationId];
        return updated;
      });

      fetchIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete integration');
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-2">Connect monitoring tools and communication platforms</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {Object.keys(configuredIntegrations).length} configured
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{integrations.length} available</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Configured Integrations */}
      {Object.keys(configuredIntegrations).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Connected Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(configuredIntegrations).map((integration) => (
              <IntegrationCard
                key={integration.type}
                id={integration.id}
                type={integration.type}
                name={integration.name}
                description={integration.description}
                icon={integration.icon}
                enabled={integration.enabled}
                orgSlug={orgSlug}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Available Integrations</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {filteredIntegrations.length}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg border border-gray-200 p-6 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((integration) => {
              const isConfigured = configuredIntegrations[integration.type];

              return isConfigured ? null : (
                <div
                  key={integration.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <span className="text-4xl">{integration.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(integration.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                    >
                      <Plus size={16} />
                      Connect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredIntegrations.length === 0 && selectedCategory !== 'all' && (
          <div className="text-center py-12">
            <p className="text-gray-600">No integrations in this category</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              View all integrations
            </button>
          </div>
        )}
      </div>

      {/* Setup Modal Placeholder */}
      {setupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">
                Setup {AVAILABLE_INTEGRATIONS.find((i) => i.id === setupModal.id)?.name}
              </h3>
              <button
                onClick={() => setSetupModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Setup wizard for {setupModal.type} integration would be rendered here.
              </p>
              <p className="text-sm text-gray-500">
                This is a placeholder - integration setup wizards will be implemented per type.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
