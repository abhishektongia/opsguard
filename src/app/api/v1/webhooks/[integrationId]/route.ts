import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// Extracts value from object using JSONPath-like syntax
// Examples: "alert.title", "payload[0].summary", "alerts[0].labels.alertname"
function extractValueByPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (!current) return null;

    // Handle array indices like "alerts[0]"
    const match = part.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      const [, key, index] = match;
      current = current[key]?.[parseInt(index)];
    } else {
      current = current[part];
    }
  }

  return current;
}

// Auto-detect severity from keywords in text
function detectSeverity(text: string): string {
  if (!text) return 'P3'; // default to P3

  const upper = text.toUpperCase();
  if (upper.includes('CRITICAL') || upper.includes('FATAL') || upper.includes('EMERGENCY')) {
    return 'P1';
  }
  if (upper.includes('ERROR') || upper.includes('ALERT') || upper.includes('HIGH')) {
    return 'P1';
  }
  if (upper.includes('WARNING') || upper.includes('WARN') || upper.includes('MEDIUM')) {
    return 'P2';
  }
  if (upper.includes('INFO') || upper.includes('NOTICE')) {
    return 'P3';
  }
  if (upper.includes('DEBUG') || upper.includes('LOW')) {
    return 'P4';
  }
  return 'P3';
}

// Normalize severity from various formats to P1-P5
function normalizeSeverity(severity: any): string {
  if (!severity) return 'P3';

  const str = String(severity).toUpperCase();

  if (str.includes('P1') || str.includes('CRITICAL') || str.includes('FATAL')) return 'P1';
  if (str.includes('P2') || str.includes('HIGH') || str.includes('ERROR')) return 'P2';
  if (str.includes('P3') || str.includes('MEDIUM') || str.includes('WARNING')) return 'P3';
  if (str.includes('P4') || str.includes('LOW') || str.includes('INFO')) return 'P4';
  if (str.includes('P5') || str.includes('DEBUG')) return 'P5';

  return 'P3';
}

export async function POST(
  request: NextRequest,
  { params }: { params: { integrationId: string } },
) {
  try {
    const body = await request.json();

    // Find the integration to get org context and field mapping
    const integration = await prisma.integration.findUnique({
      where: { id: params.integrationId },
      select: {
        id: true,
        orgId: true,
        type: true,
        enabled: true,
        config: true,
      },
    });

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    if (!integration.enabled) {
      return NextResponse.json({ error: 'Integration is disabled' }, { status: 403 });
    }

    const config = integration.config as any;
    const fieldMapping = config?.fieldMapping || {};

    // Extract alert fields using field mapping
    let title = extractValueByPath(body, fieldMapping.title || 'title') || 'Unnamed Alert';
    let description = extractValueByPath(body, fieldMapping.description || 'description') || '';
    let severity = extractValueByPath(body, fieldMapping.severity || 'severity') ||
      detectSeverity(title + ' ' + description);
    const source = extractValueByPath(body, fieldMapping.source || 'source') || integration.type;
    const tagsStr = extractValueByPath(body, fieldMapping.tags || 'tags') || '';

    // Normalize severity
    severity = normalizeSeverity(severity);

    // Parse tags
    const tags: string[] = [];
    if (typeof tagsStr === 'string') {
      tags.push(...tagsStr.split(',').map((t) => t.trim().toLowerCase()));
    } else if (Array.isArray(tagsStr)) {
      tags.push(...tagsStr.map((t) => String(t).toLowerCase()));
    }

    // Create alert in database
    const alert = await prisma.alert.create({
      data: {
        orgId: integration.orgId,
        title: String(title).substring(0, 200), // limit title length
        description: String(description).substring(0, 2000),
        severity: severity as any,
        status: 'OPEN',
        source: String(source).substring(0, 100),
        integrationId: integration.id,
        rawPayload: body, // store entire payload for reference
        tags: tags,
      },
    });

    // Log webhook call
    console.log(`Webhook alert created: ${alert.id} from ${integration.type}`);

    return NextResponse.json(
      {
        success: true,
        alertId: alert.id,
        severity: alert.severity,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    );
  }
}
