import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LeaveRequest, LeaveBalance } from '../types';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      if (user?.role === 'employee') {
        const [requests, balance] = await Promise.all([
          apiService.getLeaveRequests(),
          apiService.getLeaveBalance(),
        ]);
        setRecentRequests(requests.slice(0, 5));
        setLeaveBalance(balance);
      } else if (user?.role === 'manager') {
        const [pending, history] = await Promise.all([
          apiService.getPendingRequests(),
          apiService.getRequestHistory(),
        ]);
        setPendingRequests(pending);
        setRecentRequests(history.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-800 bg-green-100';
      case 'rejected':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-yellow-800 bg-yellow-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.firstName}! Here's what's happening with your leave management.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {user?.role === 'employee' && (
          <>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Leave Balance
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {leaveBalance.reduce((sum, balance) => sum + balance.remainingDays, 0)} days
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {recentRequests.filter(r => r.status === 'pending').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </>
        )}
        
        {user?.role === 'manager' && (
          <>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Approvals
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {pendingRequests.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approved This Month
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {recentRequests.filter(r => r.status === 'approved').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Leave Balance (Employee only) */}
      {user?.role === 'employee' && leaveBalance.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balance</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leaveBalance.map((balance) => (
              <div key={balance.leaveTypeId} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{balance.leaveTypeName}</h4>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500">Used: {balance.usedDays}</span>
                  <span className="text-gray-500">Remaining: {balance.remainingDays}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${(balance.usedDays / balance.totalDays) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {user?.role === 'manager' ? 'Recent Activity' : 'Recent Requests'}
        </h3>
        {recentRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent requests found.</p>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user?.role === 'manager' ? 'Employee' : 'Leave Type'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user?.role === 'manager' ? request.employeeName : request.leaveTypeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.totalDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(request.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Requests (Manager only) */}
      {user?.role === 'manager' && pendingRequests.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Requests Awaiting Approval</h3>
          <div className="space-y-4">
            {pendingRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{request.employeeName}</p>
                  <p className="text-sm text-gray-500">
                    {request.leaveTypeName} • {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{request.totalDays} days</p>
                  <p className="text-xs text-gray-500">Applied {new Date(request.appliedDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {pendingRequests.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                And {pendingRequests.length - 3} more pending requests...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;