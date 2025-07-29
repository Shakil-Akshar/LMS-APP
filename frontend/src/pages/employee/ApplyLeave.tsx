import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaveType } from '../../types';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ApplyLeave: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const types = await apiService.getLeaveTypes();
      setLeaveTypes(types.filter(type => type.isActive));
    } catch (error) {
      console.error('Error loading leave types:', error);
    }
  };

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const totalDays = calculateDays(formData.startDate, formData.endDate);
      
      await apiService.createLeaveRequest({
        ...formData,
        totalDays,
      });

      setSuccess('Leave request submitted successfully!');
      setTimeout(() => {
        navigate('/requests');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const totalDays = calculateDays(formData.startDate, formData.endDate);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submit a new leave request for approval.
        </p>
      </div>

      <div className="card">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="leaveTypeId" className="label">
              Leave Type *
            </label>
            <select
              id="leaveTypeId"
              name="leaveTypeId"
              required
              className="input-field"
              value={formData.leaveTypeId}
              onChange={handleChange}
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.daysAllowed} days allowed)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="label">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                className="input-field"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="label">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                required
                className="input-field"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {totalDays > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Total Days:</strong> {totalDays} day{totalDays !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="reason" className="label">
              Reason *
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={4}
              required
              className="input-field"
              placeholder="Please provide a reason for your leave request..."
              value={formData.reason}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/requests')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;