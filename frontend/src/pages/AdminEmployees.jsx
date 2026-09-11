import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  CheckCircle,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';

export const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: 'Employee@123',
    department: 'Engineering',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useNotification();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/employees');
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      showToast('Failed to load employees list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/users/employees', newEmployee);
      if (res.data.success) {
        showToast(`Employee ${res.data.employee.name} added successfully!`, 'success');
        setIsAddModalOpen(false);
        setNewEmployee({
          name: '',
          email: '',
          password: 'Employee@123',
          department: 'Engineering',
          phone: '',
        });
        fetchEmployees();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add employee', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Employee Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View all team members, monitor individual task workloads, and onboard new employees
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl shadow-md shadow-violet-100 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add New Employee
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Loading employees...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No employees found matching your search.
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div
              key={emp._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-violet-700 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-violet-200">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{emp.name}</h3>
                    <span className="inline-block text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 mt-0.5">
                      {emp.department}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 mb-5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Workload statistics */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Task Workload
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <p className="text-sm font-extrabold text-slate-800">
                      {emp.taskStats?.total || 0}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">Total</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                    <p className="text-sm font-extrabold text-amber-700">
                      {emp.taskStats?.inProgress || 0}
                    </p>
                    <p className="text-[10px] text-amber-600 font-medium">Active</p>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <p className="text-sm font-extrabold text-emerald-700">
                      {emp.taskStats?.completed || 0}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">Done</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Miller"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="jordan.miller@xplore.com"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Department
            </label>
            <select
              value={newEmployee.department}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, department: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="Frontend Engineering">Frontend Engineering</option>
              <option value="Backend Engineering">Backend Engineering</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="DevOps & Cloud">DevOps &amp; Cloud</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Product Management">Product Management</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Initial Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newEmployee.password}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, password: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Phone (Optional)
            </label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Employee Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
