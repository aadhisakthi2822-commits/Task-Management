import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RotateCcw,
  Calendar,
  Layers,
  ArrowUpRight,
  Send,
  History,
} from 'lucide-react';
import { StatsCard } from '../components/common/StatsCard';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { StatusUpdateModal } from '../components/employee/StatusUpdateModal';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { showToast, openEmailDrawer } = useNotification();

  const [stats, setStats] = useState({
    totalTasks: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    completionRate: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  // Status update modal
  const [taskToUpdate, setTaskToUpdate] = useState(null);
  const [historyTask, setHistoryTask] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load employee stats:', err);
    }
  };

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

      const res = await api.get(`/tasks?${params.toString()}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
        setTotalPages(res.data.pagination.totalPages);
        setTotalTasks(res.data.pagination.totalTasks);
      }
    } catch (err) {
      console.error('Failed to load employee tasks:', err);
      showToast('Error loading assigned tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, selectedStatus, selectedPriority, showToast]);

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusUpdated = () => {
    fetchStats();
    fetchTasks();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPriority('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-2">
            Employee Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
            Review your assigned deliverables and update their progress. Each status change automatically informs your Administrator via email.
          </p>
        </div>

        <button
          onClick={openEmailDrawer}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl transition-colors"
        >
          <Send className="w-3.5 h-3.5 text-indigo-300" />
          View Dispatched Emails
        </button>
      </div>

      {/* Task Statistics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            My Task Metrics
          </h2>
          <span className="text-xs font-semibold text-indigo-600">
            {stats.completionRate}% Personal Completion
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Assigned"
            count={stats.totalTasks}
            icon={Layers}
            color="indigo"
            subtitle="Assigned to your queue"
          />
          <StatsCard
            title="Not Started"
            count={stats.notStarted}
            icon={Clock}
            color="slate"
            subtitle="Needs initial kickoff"
          />
          <StatsCard
            title="In Progress"
            count={stats.inProgress}
            icon={AlertCircle}
            color="amber"
            subtitle="Work in active development"
          />
          <StatsCard
            title="Completed"
            count={stats.completed}
            icon={CheckCircle2}
            color="emerald"
            subtitle="Finished deliverables"
          />
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search your assigned tasks..."
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {(searchTerm || selectedStatus || selectedPriority) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Found <strong className="text-indigo-600 font-bold">{totalTasks}</strong> matching tasks
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

      {/* Task Listing Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Task Title &amp; Description</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Current Status</th>
                <th className="py-3.5 px-6">Assigned By</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading your assignments...</span>
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No assigned tasks found matching your filters.
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
                        Assigned on: {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-slate-700">
                      <div className="font-semibold">{task.assignedBy?.name || 'Administrator'}</div>
                      <div className="text-[10px] text-slate-400">{task.assignedBy?.email}</div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap font-medium text-slate-600">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : 'No due date'}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {task.statusHistory && task.statusHistory.length > 0 && (
                          <button
                            onClick={() => setHistoryTask(task)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Status History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setTaskToUpdate(task)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Change Status</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Status Update Modal */}
      {taskToUpdate && (
        <StatusUpdateModal
          isOpen={!!taskToUpdate}
          onClose={() => setTaskToUpdate(null)}
          task={taskToUpdate}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      {/* Status History Modal */}
      <Modal
        isOpen={!!historyTask}
        onClose={() => setHistoryTask(null)}
        title={`Status History: ${historyTask?.title}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-3 text-xs">
          <div className="divide-y divide-slate-100">
            {historyTask?.statusHistory?.map((h, i) => (
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
