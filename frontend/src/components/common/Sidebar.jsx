import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Mail,
  Shield,
  Layers,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const Sidebar = () => {
  const { isAdmin, user } = useAuth();
  const { openEmailDrawer } = useNotification();

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/tasks', label: 'Task Management', icon: CheckSquare },
    { to: '/admin/employees', label: 'Employees', icon: Users },
  ];

  const employeeLinks = [
    { to: '/employee', label: 'My Tasks', icon: CheckSquare, end: true },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Tools & Audit
          </p>
          <button
            onClick={openEmailDrawer}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
          >
            <Mail className="w-4 h-4 text-violet-600" />
            <span>Email Audit Center</span>
          </button>
        </div>
      </div>

      {/* Role Card at bottom */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50/50 border border-slate-200/70 text-xs">
        <div className="flex items-center gap-2 mb-1 text-slate-800 font-bold">
          <Layers className="w-4 h-4 text-violet-600" />
          <span>Role-Based Access</span>
        </div>
        <p className="text-slate-500 text-[11px]">
          Logged in as <strong>{user?.role}</strong> ({user?.name}).
        </p>
      </div>
    </aside>
  );
};
