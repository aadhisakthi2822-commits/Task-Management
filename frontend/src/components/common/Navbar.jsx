import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  CheckSquare,
  LogOut,
  Mail,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailLogsModal } from './EmailLogsModal';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isEmailDrawerOpen, openEmailDrawer, closeEmailDrawer } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link
                to={isAdmin ? '/admin' : '/employee'}
                className="flex items-center gap-2.5 font-bold text-lg text-slate-900 tracking-tight"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-violet-200">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-900">TaskFlow</span>
                  <span className="text-xs ml-1.5 px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 font-semibold border border-violet-100 hidden sm:inline-block">
                    Mini Project
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Email Notification Center button */}
              <button
                onClick={openEmailDrawer}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-xs shadow-xs transition-colors"
                title="View Dispatched Email Notifications"
              >
                <Mail className="w-4 h-4 text-violet-600" />
                <span>Email Logs</span>
              </button>

              {/* Role badge and User info */}
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {user?.name}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        isAdmin
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      {isAdmin ? (
                        <ShieldCheck className="w-2.5 h-2.5" />
                      ) : (
                        <Briefcase className="w-2.5 h-2.5" />
                      )}
                      {user?.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={openEmailDrawer}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Mail className="w-5 h-5 text-violet-600" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="font-bold text-sm text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-violet-50 text-violet-700">
                {user?.role}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Dashboard Overview
                  </Link>
                  <Link
                    to="/admin/tasks"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Task Management
                  </Link>
                  <Link
                    to="/admin/employees"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Employees Directory
                  </Link>
                </>
              ) : (
                <Link
                  to="/employee"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  My Assigned Tasks
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openEmailDrawer();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-violet-700 hover:bg-violet-50"
              >
                <Mail className="w-4 h-4" />
                Email Notifications Center
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Email Notification Modal */}
      <EmailLogsModal isOpen={isEmailDrawerOpen} onClose={closeEmailDrawer} />
    </>
  );
};
