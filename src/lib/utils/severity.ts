import { Severity, SEVERITY_LEVELS } from '@/lib/constants';

export function getSeverityColor(severity: Severity): string {
  return SEVERITY_LEVELS[severity]?.color || '#6b7280';
}

export function getSeverityBgColor(severity: Severity): string {
  return SEVERITY_LEVELS[severity]?.bgColor || 'bg-gray-500';
}

export function getSeverityLabel(severity: Severity): string {
  return SEVERITY_LEVELS[severity]?.label || severity;
}

export function formatSeverity(severity: string): Severity {
  const normalized = severity.toUpperCase();
  if (['P1', 'P2', 'P3', 'P4', 'P5'].includes(normalized)) {
    return normalized as Severity;
  }
  // Auto-detect severity from keywords
  if (
    normalized.includes('CRITICAL') ||
    normalized.includes('FATAL') ||
    normalized.includes('EMERGENCY')
  ) {
    return 'P1';
  }
  if (
    normalized.includes('ERROR') ||
    normalized.includes('ALERT') ||
    normalized.includes('SEVERE')
  ) {
    return 'P2';
  }
  if (normalized.includes('WARNING') || normalized.includes('WARN')) {
    return 'P3';
  }
  if (normalized.includes('INFO') || normalized.includes('NOTICE')) {
    return 'P4';
  }
  return 'P5';
}
