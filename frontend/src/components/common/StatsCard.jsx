import React from 'react';

export const StatsCard = ({ title, count, icon: Icon, color = 'violet', subtitle }) => {
  const colorMap = {
    violet: {
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      border: 'border-violet-100',
    },
    amber: {
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      border: 'border-amber-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    slate: {
      bg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      border: 'border-slate-200',
    },
    rose: {
      bg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      border: 'border-rose-100',
    },
  };

  const scheme = colorMap[color] || colorMap.violet;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{count}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl ${scheme.bg} ${scheme.border} border`}>
          <Icon className={`w-6 h-6 ${scheme.iconColor}`} />
        </div>
      </div>
    </div>
  );
};
