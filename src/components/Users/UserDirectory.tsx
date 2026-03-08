'use client';

import { Mail, Shield, Edit2, Trash2, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  lastLoginAt: Date | null;
  createdAt: Date;
  teamMembers?: any[];
}

interface UserDirectoryProps {
  users: User[];
  onInviteClick: () => void;
  onEditClick: (user: User) => void;
  onRemoveClick: (userId: string) => void;
  isLoading?: boolean;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'OWNER':
      return 'bg-purple-100 text-purple-700';
    case 'ADMIN':
      return 'bg-blue-100 text-blue-700';
    case 'MEMBER':
      return 'bg-green-100 text-green-700';
    case 'VIEWER':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export function UserDirectory({
  users,
  onInviteClick,
  onEditClick,
  onRemoveClick,
  isLoading,
}: UserDirectoryProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Teams
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No users yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Role
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Teams
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Last Active
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                      user.role,
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {user.teamMembers && user.teamMembers.length > 0
                    ? user.teamMembers.length
                    : '—'}
                </td>
                <td className="px-6 py-4 text-gray-600 text-xs">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditClick(user)}
                      className="p-1 hover:bg-gray-200 rounded transition"
                      title="Edit user"
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => onRemoveClick(user.id)}
                      className="p-1 hover:bg-red-100 rounded transition"
                      title="Remove user"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
