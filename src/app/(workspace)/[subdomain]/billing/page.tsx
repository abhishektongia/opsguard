'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface Subscription {
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  seats: number;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  pdfUrl?: string;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    monthly: true,
    description: 'For getting started',
    features: [
      '10 alerts/day',
      '1 integration',
      '1 user',
      '7 day retention',
      'Community support',
    ],
    cta: 'Current Plan',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    monthly: true,
    description: 'For small teams',
    features: [
      'Unlimited alerts',
      '5 integrations',
      '5 users',
      '30 day retention',
      'Email support',
      'Basic API access',
    ],
    cta: 'Upgrade to Starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    monthly: true,
    description: 'For growing teams',
    features: [
      'Unlimited alerts',
      'Unlimited integrations',
      '25 users',
      '90 day retention',
      'Priority support',
      'Advanced API access',
      'Webhook integrations',
      'On-call management',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    monthly: true,
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Unlimited users',
      '1 year retention',
      '24/7 phone support',
      'Custom integrations',
      'SSO/SAML',
      'Advanced security',
    ],
    cta: 'Contact Sales',
  },
];

export default function BillingPage() {
  const params = useParams();
  const orgSlug = params.subdomain as string;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [subRes, invRes] = await Promise.all([
        fetch('/api/v1/billing/subscription'),
        fetch('/api/v1/billing/invoices'),
      ]);

      if (!subRes.ok || !invRes.ok) {
        throw new Error('Failed to fetch billing data');
      }

      const subData = await subRes.json();
      const invData = await invRes.json();

      setSubscription(subData);
      setInvoices(invData.invoices || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') {
      window.open('mailto:sales@opsguard.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }

    setUpgrading(planId);
    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) {
        throw new Error('Failed to initiate upgrade');
      }

      const data = await res.json();
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade');
    } finally {
      setUpgrading(null);
    }
  };

  const currentPlan = PLANS.find((p) => p.id === subscription?.plan);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your plan and billing information</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Current Subscription */}
          {subscription && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentPlan?.name} Plan</h2>
                  <p className="text-gray-600 mt-1">{currentPlan?.description}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    subscription.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : subscription.status === 'trial'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {subscription.status === 'active'
                    ? 'Active'
                    : subscription.status === 'trial'
                      ? 'Trial'
                      : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Monthly Cost</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${currentPlan?.price || 'Custom'}
                    {currentPlan?.price !== null && <span className="text-sm text-gray-600">/mo</span>}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Seats Used</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {subscription.seats}
                    <span className="text-sm text-gray-600 ml-1">/ {currentPlan?.name === 'Enterprise' ? '∞' : currentPlan?.name === 'Pro' ? '25' : currentPlan?.name === 'Starter' ? '5' : '1'}</span>
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Billing Period</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Auto-Renewal</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">Enabled</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2">
                  <CreditCard size={16} />
                  Update Payment Method
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm">
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}

          {/* Plan Comparison */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Compare Plans</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = subscription?.plan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-lg border-2 p-6 space-y-4 transition ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {isCurrent && (
                      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                        <CheckCircle size={16} />
                        Current Plan
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                    </div>

                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {plan.price !== null ? `$${plan.price}` : 'Custom'}
                      </p>
                      {plan.price !== null && <p className="text-xs text-gray-600">/month</p>}
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrent || upgrading === plan.id}
                      className={`w-full py-2 rounded-lg font-medium text-sm transition ${
                        isCurrent
                          ? 'bg-gray-200 text-gray-700 cursor-default'
                          : upgrading === plan.id
                            ? 'bg-blue-400 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {upgrading === plan.id
                        ? 'Processing...'
                        : isCurrent
                          ? plan.cta
                          : plan.cta}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoices */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>

            {invoices.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">No invoices yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CreditCard size={18} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">${invoice.amount}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(invoice.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>

                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm font-medium"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
