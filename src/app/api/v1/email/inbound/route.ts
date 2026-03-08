import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// Verify SendGrid signature
function verifyWebhookSignature(req: any, signature: string, timestamp: string): boolean {
  // In production, verify the signature using SendGrid's public key
  // For now, just return true (implement proper verification in production)
  return true;
}

// Extract org and integration from email recipient
async function findIntegrationFromEmail(recipient: string): Promise<any> {
  const emailMatch = recipient.match(/alerts@([a-z0-9-]+)\.opsguard\.com/);
  if (!emailMatch) return null;

  const slug = emailMatch[1];
  const org = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!org) return null;

  // Find email integration for this org
  const integration = await prisma.integration.findFirst({
    where: {
      orgId: org.id,
      type: 'EMAIL',
      enabled: true,
    },
  });

  return { org, integration };
}

// Parse email message to extract alert data
function parseEmailMessage(envelope: any, html: string, text: string): any {
  const subject = envelope.subject || '(No Subject)';
  const from = envelope.from?.[0] || 'unknown@example.com';

  // Use HTML if available, fall back to text
  const body = html || text || '';

  // Auto-detect severity from subject/body keywords
  const contentForAnalysis = `${subject.toUpperCase()} ${body.toUpperCase()}`;
  let severity = 'P3';

  if (/CRITICAL|FATAL|EMERGENCY|ERROR|ALERT|HIGH/.test(contentForAnalysis)) {
    severity = 'P1';
  } else if (/WARNING|WARN|MEDIUM/.test(contentForAnalysis)) {
    severity = 'P2';
  } else if (/INFO|NOTICE/.test(contentForAnalysis)) {
    severity = 'P3';
  } else if (/DEBUG|LOW/.test(contentForAnalysis)) {
    severity = 'P4';
  }

  // Extract tags from email headers if available
  const tags = [];
  if (envelope['X-Alert-Tags']) {
    tags.push(...envelope['X-Alert-Tags'].split(',').map((t: string) => t.trim()));
  }

  return {
    title: subject.substring(0, 200),
    description: body.substring(0, 2000),
    severity,
    source: extractDomain(from),
    tags,
    rawEmail: {
      from,
      subject,
      timestamp: envelope.date,
    },
  };
}

// Extract domain from email address
function extractDomain(email: string): string {
  const match = email.match(/@(.+)$/);
  return match ? match[1] : 'email';
}

export async function POST(request: NextRequest) {
  try {
    // Get authentication header
    const signature = request.headers.get('x-sendgrid-signature');
    const timestamp = request.headers.get('x-sendgrid-timestamp');

    // Verify webhook signature (in production)
    if (signature && timestamp) {
      if (!verifyWebhookSignature(request, signature, timestamp)) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 },
        );
      }
    }

    const body = await request.json();

    // SendGrid Inbound Parse sends an array of emails
    const emails = Array.isArray(body) ? body : [body];

    const createdAlerts = [];

    for (const email of emails) {
      const { envelope, html, text, attachments } = email;

      if (!envelope || !envelope.to) {
        continue;
      }

      // Find organization and integration from recipient email
      const recipient = envelope.to[0] || envelope.to;
      const result = await findIntegrationFromEmail(recipient);

      if (!result) {
        console.log(`No matching integration for ${recipient}`);
        continue;
      }

      const { org, integration } = result;

      // Check if sender is verified (in production)
      const senderDomain = extractDomain(envelope.from[0]);
      // Implement sender verification logic here

      // Parse email and extract alert data
      const alertData = parseEmailMessage(envelope, html, text);

      // Create alert
      const alert = await prisma.alert.create({
        data: {
          orgId: org.id,
          title: alertData.title,
          description: alertData.description,
          severity: alertData.severity as any,
          status: 'OPEN',
          source: alertData.source,
          integrationId: integration?.id,
          rawPayload: alertData.rawEmail as any,
          tags: alertData.tags,
        },
      });

      createdAlerts.push({
        alertId: alert.id,
        from: envelope.from[0],
        to: recipient,
        subject: envelope.subject,
      });
    }

    console.log(`Processed ${createdAlerts.length} email alerts`);

    return NextResponse.json(
      {
        success: true,
        processed: createdAlerts.length,
        alerts: createdAlerts,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Email ingestion error:', error);
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 },
    );
  }
}
