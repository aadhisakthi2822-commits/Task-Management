import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import {
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  User,
  History,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { TaskFormModal } from '../components/admin/TaskFormModal';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';

export const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [viewHistoryTask, setViewHistoryTask] = useState(null);

  const { showToast } = useNotification();

  // Fetch employees for filter and assign dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/users/employees');
        if (res.data.success) {
          setEmployees(res.data.employees);
        }
      } catch (err) {
        console.error('Failed to load employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch tasks with search, filter, and pagination params
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (selectedEmployee) params.append('employeeId', selectedEmployee);

      const res = await api.get(`/tasks?${params.toString()}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
        setTotalPages(res.data.pagination.totalPages);
        setTotalTasks(res.data.pagination.totalTasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      showToast('Error loading tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, selectedStatus, selectedPriority, selectedEmployee, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Reset page to 1 when filters or search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePriorityFilter = (e) => {
    setSelectedPriority(e.target.value);
    setCurrentPage(1);
  };

  const handleEmployeeFilter = (e) => {
    setSelectedEmployee(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedEmployee('');
    setCurrentPage(1);
  };

  // Open Edit modal
  const handleEdit = (task) => {
    setTaskToEdit(task);
    setIsFormModalOpen(true);
  };

  // Delete Task
  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      const res = await api.delete(`/tasks/${taskToDelete._id}`);
      if (res.data.success) {
        showToast('Task deleted successfully', 'success');
        setTaskToDelete(null);
        fetchTasks();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete task', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Task Management Table
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, assign, and manage all organization tasks
          </p>
        </div>

        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl shadow-md shadow-violet-100 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Assign New Task
        </button>
      </div>

      {/* Search & Filtering Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by title, description, or employee..."
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Pending / In Progress">Pending / In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={handlePriorityFilter}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Employee filter */}
          <div>
            <select
              value={selectedEmployee}
              onChange={handleEmployeeFilter}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedStatus || selectedPriority || selectedEmployee) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Active filters found{' '}
              <strong className="text-violet-600 font-bold">{totalTasks}</strong> matching tasks
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Task Title &amp; Description</th>
                <th className="py-3.5 px-6">Assigned To</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading task records...</span>
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No tasks found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 max-w-sm">
                      <div className="font-bold text-slate-900 text-sm">{task.title}</div>
                      <div className="text-slate-500 text-xs line-clamp-2 mt-0.5">
                        {task.description}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-50 border border-violet-100 text-violet-700 font-bold flex items-center justify-center text-[10px]">
                          {task.assignedTo?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {task.assignedTo?.name || 'Unassigned'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {task.assignedTo?.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap font-medium text-slate-600">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : 'No due date'}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {task.statusHistory && task.statusHistory.length > 0 && (
                          <button
                            onClick={() => setViewHistoryTask(task)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            title="View Status History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Required Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalTasks={totalTasks}
          limit={limit}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        employees={employees}
        onSaved={fetchTasks}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Delete Task Confirmation"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p>
              Are you sure you want to permanently delete task{' '}
              <strong>"{taskToDelete?.title}"</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setTaskToDelete(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Status History Modal */}
      <Modal
        isOpen={!!viewHistoryTask}
        onClose={() => setViewHistoryTask(null)}
        title={`Status Audit Trail: ${viewHistoryTask?.title}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-3 text-xs">
          <div className="divide-y divide-slate-100">
            {viewHistoryTask?.statusHistory?.map((h, i) => (
              <div key={i} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    {h.previousStatus ? `${h.previousStatus} → ${h.newStatus}` : h.newStatus}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(h.changedAt).toLocaleString()}
                  </span>
                </div>
                {h.remarks && <p className="text-slate-500 italic">"{h.remarks}"</p>}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
