import React from 'react';

export const StatusBadge = ({ status }) => {
  const configs = {
    'Not Started': {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
    'Pending / In Progress': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500 animate-pulse',
    },
    'Completed': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
  };

  const config = configs[status] || configs['Not Started'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const configs = {
    High: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'High Priority',
    },
    Medium: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Medium Priority',
    },
    Low: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      label: 'Low Priority',
    },
  };

  const config = configs[priority] || configs['Medium'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${config.bg}`}
    >
      {config.label}
    </span>
  );
};
