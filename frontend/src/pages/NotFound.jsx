import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotFound = () => {
  const { user } = useAuth();
  const homePath = user?.role === 'admin' ? '/admin' : user?.role === 'employee' ? '/employee' : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
        <p className="text-base font-semibold text-slate-700 mt-2">Page Not Found</p>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested route does not exist or you do not have permission to view it.
        </p>
        <Link
          to={homePath}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
