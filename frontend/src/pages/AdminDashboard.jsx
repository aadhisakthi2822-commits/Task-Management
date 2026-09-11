import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  Users,
  Layers,
  ArrowRight,
  TrendingUp,
  Mail,
} from 'lucide-react';
import { StatsCard } from '../components/common/StatsCard';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { TaskFormModal } from '../components/admin/TaskFormModal';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    completionRate: 0,
    priorities: { high: 0, medium: 0, low: 0 },
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { openEmailDrawer } = useNotification();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, tasksRes, empRes] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/tasks?limit=5&sortBy=createdAt&sortOrder=desc'),
        api.get('/users/employees'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (tasksRes.data.success) {
        setRecentTasks(tasksRes.data.tasks);
      }
      if (empRes.data.success) {
        setEmployees(empRes.data.employees);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-violet-900 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-violet-950/10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/30 text-violet-100 border border-violet-400/30 mb-2">
            Administrator Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Task Management Overview
          </h1>
          <p className="text-violet-200 text-xs sm:text-sm mt-1 max-w-xl">
            Monitor company assignments, assign work to employees, and track real-time delivery statuses.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-violet-900 hover:bg-violet-50 font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-violet-600" />
            Assign New Task
          </button>
        </div>
      </div>

      {/* Required Task Statistics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Task Statistics
          </h2>
          <span className="text-xs font-semibold text-violet-600">
            {stats.completionRate}% Overall Completion
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Assigned"
            count={stats.totalTasks}
            icon={Layers}
            color="violet"
            subtitle={`${employees.length} Active Employees`}
          />
          <StatsCard
            title="Not Started"
            count={stats.notStarted}
            icon={Clock}
            color="slate"
            subtitle="Pending employee kickoff"
          />
          <StatsCard
            title="Pending / In Progress"
            count={stats.inProgress}
            icon={AlertCircle}
            color="amber"
            subtitle="Active tasks in progress"
          />
          <StatsCard
            title="Completed"
            count={stats.completed}
            icon={CheckCircle2}
            color="emerald"
            subtitle="Successfully verified"
          />
        </div>
      </div>

      {/* Middle Section: Priority Breakdown & Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority breakdown card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-600" />
            Priority Distribution
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  High Priority
                </span>
                <span>{stats.priorities?.high || 0} tasks</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.totalTasks > 0
                        ? ((stats.priorities?.high || 0) / stats.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Medium Priority
                </span>
                <span>{stats.priorities?.medium || 0} tasks</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.totalTasks > 0
                        ? ((stats.priorities?.medium || 0) / stats.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Low Priority
                </span>
                <span>{stats.priorities?.low || 0} tasks</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.totalTasks > 0
                        ? ((stats.priorities?.low || 0) / stats.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need to view sent emails?</span>
            <button
              onClick={openEmailDrawer}
              className="text-violet-600 hover:text-violet-800 font-bold flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              Email Logs
            </button>
          </div>
        </div>

        {/* Team Workload Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600" />
              Employee Workload &amp; Status
            </h3>
            <Link
              to="/admin/employees"
              className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1"
            >
              View All Employees
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {employees.slice(0, 4).map((emp) => (
              <div
                key={emp._id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-800">{emp.name}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {emp.department}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>
                    Total: <strong className="text-slate-800">{emp.taskStats?.total || 0}</strong>
                  </span>
                  <span>
                    In Progress:{' '}
                    <strong className="text-amber-600">{emp.taskStats?.inProgress || 0}</strong>
                  </span>
                  <span>
                    Done:{' '}
                    <strong className="text-emerald-600">{emp.taskStats?.completed || 0}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Assigned Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Task Assignments</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest tasks assigned to team members with real-time status
            </p>
          </div>
          <Link
            to="/admin/tasks"
            className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
          >
            Manage All Tasks
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Task Details</th>
                <th className="py-3 px-6">Assigned Employee</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Loading recent tasks...
                  </td>
                </tr>
              ) : recentTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No tasks created yet. Click "Assign New Task" to get started!
                  </td>
                </tr>
              ) : (
                recentTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{task.title}</div>
                      <div className="text-slate-500 line-clamp-1 mt-0.5">{task.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800">{task.assignedTo?.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {task.assignedTo?.department}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : 'No due date'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskFormModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        employees={employees}
        onSaved={fetchDashboardData}
      />
    </div>
  );
};
