'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface NotificationLog {
  id: string;
  alertId: string;
  alertTitle: string;
  userId?: string;
  userName?: string;
  channel: 'email' | 'sms' | 'phone' | 'slack' | 'push';
  status: 'sent' | 'failed' | 'bounced' | 'pending';
  sentAt: string;
  deliveryTimestamp?: string;
  errorMessage?: string;
}

interface NotificationLogsProps {
  logs: NotificationLog[];
  isLoading?: boolean;
}

export function NotificationLogs({ logs, isLoading }: NotificationLogsProps) {
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');
  const [filterChannel, setFilterChannel] = useState<'all' | string>('all');

  const statusIcon = {
    sent: <CheckCircle size={16} className="text-green-600" />,
    failed: <AlertCircle size={16} className="text-red-600" />,
    pending: <Clock size={16} className="text-yellow-600" />,
    bounced: <AlertCircle size={16} className="text-orange-600" />,
  };

  const statusColors = {
    sent: 'bg-green-50',
    failed: 'bg-red-50',
    pending: 'bg-yellow-50',
    bounced: 'bg-orange-50',
  };

  const channelIcons = {
    email: '📧',
    sms: '📱',
    phone: '☎️',
    slack: '💬',
    push: '🔔',
  };

  const filteredLogs = logs.filter((log) => {
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (filterChannel !== 'all' && log.channel !== filterChannel) return false;
    return true;
  });

  const channels = Array.from(new Set(logs.map((l) => l.channel)));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'sent', 'failed', 'pending'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition whitespace-nowrap ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterChannel('all')}
          className={`px-3 py-1 text-sm font-medium rounded-full transition whitespace-nowrap ${
            filterChannel === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Channels
        </button>
        {channels.map((channel) => (
          <button
            key={channel}
            onClick={() => setFilterChannel(channel)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition whitespace-nowrap flex items-center gap-1 ${
              filterChannel === channel
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{channelIcons[channel as keyof typeof channelIcons]}</span>
            {channel}
          </button>
        ))}
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No notification logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <button
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className={`w-full text-left rounded-lg border border-gray-200 p-3 transition hover:shadow-md ${
                statusColors[log.status] || 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {statusIcon[log.status]}
                    <span className="font-semibold text-gray-900 text-sm">{log.alertTitle}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {log.userName || 'Unknown'} via{' '}
                    <span className="font-mono capitalize">{log.channel}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(log.sentAt), { addSuffix: true })}
                  </p>
                  {log.errorMessage && (
                    <p className="text-xs text-red-700 mt-1">{log.errorMessage}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                  log.status === 'sent' ? 'bg-green-200 text-green-800' :
                  log.status === 'failed' ? 'bg-red-200 text-red-800' :
                  log.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-orange-200 text-orange-800'
                }`}>
                  {log.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">Notification Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Alert</p>
                <p className="font-semibold text-gray-900">{selectedLog.alertTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Channel</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-lg">
                      {channelIcons[selectedLog.channel as keyof typeof channelIcons]}
                    </span>
                    <p className="font-semibold text-gray-900 capitalize">{selectedLog.channel}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Status</p>
                  <div className="flex items-center gap-1 mt-1">
                    {statusIcon[selectedLog.status]}
                    <p className="font-semibold text-gray-900 capitalize">{selectedLog.status}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Recipient</p>
                <p className="font-semibold text-gray-900">{selectedLog.userName || 'Unknown'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Sent At</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedLog.sentAt).toLocaleString()}
                  </p>
                </div>

                {selectedLog.deliveryTimestamp && (
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Delivered At</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedLog.deliveryTimestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedLog.errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-800 font-medium mb-1">Error</p>
                  <p className="text-sm text-red-700">{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
