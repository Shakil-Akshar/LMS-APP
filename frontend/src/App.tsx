import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/employee/ApplyLeave';
import LeaveBalance from './pages/employee/LeaveBalance';
import MyRequests from './pages/employee/MyRequests';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        
        {/* Employee routes */}
        {user.role === 'employee' && (
          <>
            <Route path="apply" element={<ApplyLeave />} />
            <Route path="balance" element={<LeaveBalance />} />
            <Route path="requests" element={<MyRequests />} />
          </>
        )}
        
        {/* Manager routes */}
        {user.role === 'manager' && (
          <>
            <Route path="manager/pending" element={<div>Manager Pending Requests</div>} />
            <Route path="manager/history" element={<div>Manager Request History</div>} />
          </>
        )}
        
        {/* Admin routes */}
        {user.role === 'admin' && (
          <>
            <Route path="admin/users" element={<div>Admin Users Management</div>} />
            <Route path="admin/leave-types" element={<div>Admin Leave Types</div>} />
            <Route path="admin/holidays" element={<div>Admin Holidays</div>} />
          </>
        )}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ProtectedRoute>
            <AppRoutes />
          </ProtectedRoute>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;