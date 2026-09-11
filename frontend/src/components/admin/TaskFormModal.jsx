import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Send, AlertCircle } from 'lucide-react';

export const TaskFormModal = ({ isOpen, onClose, taskToEdit, onSaved, employees }) => {
  const { showToast } = useNotification();
  const isEditing = !!taskToEdit;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'Not Started',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        assignedTo: taskToEdit.assignedTo?._id || taskToEdit.assignedTo || '',
        priority: taskToEdit.priority || 'Medium',
        status: taskToEdit.status || 'Not Started',
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignedTo: employees && employees.length > 0 ? employees[0]._id : '',
        priority: 'Medium',
        status: 'Not Started',
        dueDate: '',
      });
    }
    setErrors({});
  }, [taskToEdit, isOpen, employees]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Task title is required';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Task description is required';
    }

    if (!formData.assignedTo) {
      errs.assignedTo = 'Please assign an employee';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditing) {
        const res = await api.put(`/tasks/${taskToEdit._id}`, formData);
        if (res.data.success) {
          showToast('Task updated successfully!', 'success');
          onSaved(res.data.task);
          onClose();
        }
      } else {
        const res = await api.post('/tasks', formData);
        if (res.data.success) {
          showToast(
            'Task assigned successfully! Email notification dispatched to employee.',
            'success'
          );
          onSaved(res.data.task);
          onClose();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save task';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task Details' : 'Assign New Task to Employee'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Implement API pagination and filtering"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-3.5 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 ${
              errors.title
                ? 'border-rose-300 ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'
            }`}
          />
          {errors.title && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Task Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Provide detailed instructions and acceptance criteria for the employee..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
              errors.description
                ? 'border-rose-300 ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Assign To Employee */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Assigned Employee <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className={`w-full px-3.5 py-2 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 ${
              errors.assignedTo
                ? 'border-rose-300 ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'
            }`}
          >
            <option value="" disabled>
              Select an employee
            </option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} — ({emp.department} &bull; {emp.email})
              </option>
            ))}
          </select>
          {errors.assignedTo && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.assignedTo}</p>
          )}
        </div>

        {/* Priority & Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Priority Level <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🟢 Low Priority</option>
            </select>
          </div>

          {isEditing ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="Not Started">⚪ Not Started</option>
                <option value="Pending / In Progress">🟡 Pending / In Progress</option>
                <option value="Completed">🟢 Completed</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          )}
        </div>

        {isEditing && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        )}

        {!isEditing && (
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              An automated notification email will be dispatched to the selected employee upon submission.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Task' : 'Assign Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
