'use client';

import { CheckCircle, X, Trash2, GitMerge } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onAcknowledge: () => void;
  onAssign: () => void;
  onClose: () => void;
  onMerge: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function BulkActions({
  selectedCount,
  onAcknowledge,
  onAssign,
  onClose,
  onMerge,
  onClear,
  isLoading,
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between sticky bottom-0">
      <span className="text-sm font-medium text-blue-900">
        {selectedCount} alert{selectedCount !== 1 ? 's' : ''} selected
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={onAcknowledge}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50 transition"
          title="Acknowledge selected alerts"
        >
          <CheckCircle size={16} />
          Acknowledge
        </button>

        <button
          onClick={onAssign}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 transition"
          title="Assign selected alerts"
        >
          Assign
        </button>

        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
          title="Close selected alerts"
        >
          Close
        </button>

        <button
          onClick={onMerge}
          disabled={isLoading || selectedCount < 2}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Merge selected alerts (requires 2+)"
        >
          <GitMerge size={16} />
          Merge
        </button>

        <button
          onClick={onClear}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded text-gray-600 hover:bg-gray-200 transition"
          title="Clear selection"
        >
          <X size={16} />
          Clear
        </button>
      </div>
    </div>
  );
}
