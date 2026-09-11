import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { StatusBadge } from '../common/Badge';
import { Send, CheckCircle2 } from 'lucide-react';

export const StatusUpdateModal = ({ isOpen, onClose, task, onStatusUpdated }) => {
  const { showToast } = useNotification();
  const [selectedStatus, setSelectedStatus] = useState(task?.status || 'Not Started');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!task) return null;

  const statuses = [
    {
      value: 'Not Started',
      label: 'Not Started',
      desc: 'Work has not begun on this assignment yet',
      color: 'border-slate-300 bg-slate-50',
    },
    {
      value: 'Pending / In Progress',
      label: 'Pending / In Progress',
      desc: 'Currently in progress or undergoing development/review',
      color: 'border-amber-300 bg-amber-50',
    },
    {
      value: 'Completed',
      label: 'Completed',
      desc: 'All criteria fulfilled, deliverable is finished and verified',
      color: 'border-emerald-300 bg-emerald-50',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedStatus === task.status && !remarks) {
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.patch(`/tasks/${task._id}/status`, {
        status: selectedStatus,
        remarks: remarks || `Status transitioned to ${selectedStatus}`,
      });

      if (res.data.success) {
        showToast(
          `Status changed to "${selectedStatus}". Email notification dispatched to Admin!`,
          'success'
        );
        onStatusUpdated(res.data.task);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Task Status"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Select New Status
          </label>
          <div className="space-y-2.5">
            {statuses.map((item) => {
              const isSelected = selectedStatus === item.value;
              return (
                <div
                  key={item.value}
                  onClick={() => setSelectedStatus(item.value)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-violet-600 bg-violet-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isSelected ? 'text-violet-900' : 'text-slate-800'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-violet-600 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Progress Remarks / Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add any progress notes, completion summary, or blocker details..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500"
          />
        </div>

        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            The Administrator will be immediately notified via automated email about this status update.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md shadow-violet-100 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {submitting ? 'Updating...' : 'Save & Notify Admin'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
