export type Severity = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export const SEVERITY_LEVELS: Record<Severity, { label: string; color: string; bgColor: string }> = {
  P1: { label: 'Critical', color: '#dc2626', bgColor: 'bg-red-600' },
  P2: { label: 'High', color: '#ea580c', bgColor: 'bg-orange-600' },
  P3: { label: 'Medium', color: '#eab308', bgColor: 'bg-yellow-500' },
  P4: { label: 'Low', color: '#3b82f6', bgColor: 'bg-blue-500' },
  P5: { label: 'Minimal', color: '#6b7280', bgColor: 'bg-gray-500' },
};

export const ALERT_STATUSES = {
  OPEN: { label: 'Open', color: '#dc2626', bgColor: 'bg-red-600' },
  ACK: { label: 'Acknowledged', color: '#eab308', bgColor: 'bg-yellow-500' },
  RESOLVED: { label: 'Resolved', color: '#22c55e', bgColor: 'bg-green-600' },
  CLOSED: { label: 'Closed', color: '#9ca3af', bgColor: 'bg-gray-400' },
};

export const INCIDENT_STATUSES = {
  INVESTIGATING: { label: 'Investigating', color: '#ea580c' },
  IDENTIFIED: { label: 'Identified', color: '#eab308' },
  MONITORING: { label: 'Monitoring', color: '#3b82f6' },
  RESOLVED: { label: 'Resolved', color: '#22c55e' },
};

export const PLANS = {
  FREE: { label: 'Free', price: 0, seats: 1 },
  STARTER: { label: 'Starter', price: 99, seats: 5 },
  PRO: { label: 'Pro', price: 299, seats: 20 },
  ENTERPRISE: { label: 'Enterprise', price: 0, seats: 0, custom: true },
};

export const INTEGRATION_TYPES = {
  SLACK: { label: 'Slack', icon: 'slack' },
  MSTEAMS: { label: 'Microsoft Teams', icon: 'msteams' },
  DATADOG: { label: 'Datadog', icon: 'datadog' },
  GRAFANA: { label: 'Grafana', icon: 'grafana' },
  PROMETHEUS: { label: 'Prometheus', icon: 'prometheus' },
  EMAIL: { label: 'Email', icon: 'mail' },
  PAGERDUTY: { label: 'PagerDuty', icon: 'pagerduty' },
  JIRA: { label: 'Jira', icon: 'jira' },
  SERVICENOW: { label: 'ServiceNow', icon: 'servicenow' },
  GITHUB: { label: 'GitHub', icon: 'github' },
  JENKINS: { label: 'Jenkins', icon: 'jenkins' },
  CUSTOM: { label: 'Custom Webhook', icon: 'webhook' },
};

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  CALL: 'call',
  SLACK_DM: 'slack_dm',
  PUSH: 'push',
};
