import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminTasks } from './pages/AdminTasks';
import { AdminEmployees } from './pages/AdminEmployees';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/common/Layout';

const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user?.role === 'admin' ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/employee" replace />
  );
};

export const App = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Public Login */}
      <Route path="/login" element={<Login />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminTasks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminEmployees />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Employee Protected Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Layout>
              <EmployeeDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
