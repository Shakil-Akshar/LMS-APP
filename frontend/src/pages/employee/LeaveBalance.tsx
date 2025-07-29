import React, { useState, useEffect } from 'react';
import { LeaveBalance as LeaveBalanceType } from '../../types';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const LeaveBalance: React.FC = () => {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalanceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaveBalance();
  }, []);

  const loadLeaveBalance = async () => {
    try {
      const balance = await apiService.getLeaveBalance();
      setLeaveBalance(balance);
    } catch (error) {
      console.error('Error loading leave balance:', error);
    } finally {
      setIsLoading(false);
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Balance</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your current leave balance and usage.
        </p>
      </div>

      {leaveBalance.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No leave balance information available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leaveBalance.map((balance) => (
            <div key={balance.leaveTypeId} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {balance.leaveTypeName}
                </h3>
                <span className="text-2xl font-bold text-primary-600">
                  {balance.remainingDays}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Allocated:</span>
                  <span className="font-medium">{balance.totalDays} days</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Used:</span>
                  <span className="font-medium text-red-600">{balance.usedDays} days</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Remaining:</span>
                  <span className="font-medium text-green-600">{balance.remainingDays} days</span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Usage</span>
                    <span>{Math.round((balance.usedDays / balance.totalDays) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((balance.usedDays / balance.totalDays) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Status indicator */}
                <div className="mt-3">
                  {balance.remainingDays === 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Exhausted
                    </span>
                  ) : balance.remainingDays <= 2 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Low Balance
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Available
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Policy Information</h3>
        <div className="prose prose-sm text-gray-600">
          <ul>
            <li>Leave balances are calculated based on your employment start date and company policy.</li>
            <li>Unused leave days may carry over to the next year based on company policy.</li>
            <li>Leave requests are subject to manager approval and business requirements.</li>
            <li>For questions about your leave balance, please contact HR or your manager.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;