'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutGrid,
  Bell,
  Flame,
  Users,
  Clock,
  Puzzle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  orgSlug: string;
  userName: string;
}

export function Sidebar({ orgSlug, userName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      href: `/${orgSlug}/dashboard`,
      icon: LayoutGrid,
      label: 'Dashboard',
    },
    {
      href: `/${orgSlug}/alerts`,
      icon: Bell,
      label: 'Alerts',
    },
    {
      href: `/${orgSlug}/incidents`,
      icon: Flame,
      label: 'Incidents',
    },
    {
      href: `/${orgSlug}/teams`,
      icon: Users,
      label: 'Teams',
    },
    {
      href: `/${orgSlug}/on-call`,
      icon: Clock,
      label: 'On-Call',
    },
    {
      href: `/${orgSlug}/integrations`,
      icon: Puzzle,
      label: 'Integrations',
    },
    {
      href: `/${orgSlug}/settings`,
      icon: Settings,
      label: 'Settings',
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-slate-900 text-white flex flex-col transition-all duration-300 border-r border-slate-700`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="font-bold text-lg">OpsGuard</h1>
            <p className="text-xs text-slate-400">Incident Mgmt</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-slate-800 rounded"
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-700 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-slate-400">Owner</p>
            </div>
          )}
        </div>

        <button
          onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}
