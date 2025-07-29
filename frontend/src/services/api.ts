import axios from 'axios';
import { User, LeaveRequest, LeaveType, LeaveBalance, Holiday } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Users (Admin only)
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  createUser: async (userData: Partial<User>) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  // Leave Types (Admin only)
  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await api.get('/admin/leave-types');
    return response.data;
  },

  createLeaveType: async (leaveTypeData: Partial<LeaveType>) => {
    const response = await api.post('/admin/leave-types', leaveTypeData);
    return response.data;
  },

  updateLeaveType: async (id: string, leaveTypeData: Partial<LeaveType>) => {
    const response = await api.put(`/admin/leave-types/${id}`, leaveTypeData);
    return response.data;
  },

  deleteLeaveType: async (id: string) => {
    await api.delete(`/admin/leave-types/${id}`);
  },

  // Holidays (Admin only)
  getHolidays: async (): Promise<Holiday[]> => {
    const response = await api.get('/admin/holidays');
    return response.data;
  },

  createHoliday: async (holidayData: Partial<Holiday>) => {
    const response = await api.post('/admin/holidays', holidayData);
    return response.data;
  },

  updateHoliday: async (id: string, holidayData: Partial<Holiday>) => {
    const response = await api.put(`/admin/holidays/${id}`, holidayData);
    return response.data;
  },

  deleteHoliday: async (id: string) => {
    await api.delete(`/admin/holidays/${id}`);
  },

  // Leave Requests
  getLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/employee/requests');
    return response.data;
  },

  createLeaveRequest: async (requestData: Partial<LeaveRequest>) => {
    const response = await api.post('/employee/requests', requestData);
    return response.data;
  },

  updateLeaveRequest: async (id: string, requestData: Partial<LeaveRequest>) => {
    const response = await api.put(`/employee/requests/${id}`, requestData);
    return response.data;
  },

  deleteLeaveRequest: async (id: string) => {
    await api.delete(`/employee/requests/${id}`);
  },

  // Manager actions
  getPendingRequests: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/manager/pending');
    return response.data;
  },

  approveRequest: async (id: string, comments?: string) => {
    const response = await api.post(`/manager/approve/${id}`, { comments });
    return response.data;
  },

  rejectRequest: async (id: string, comments: string) => {
    const response = await api.post(`/manager/reject/${id}`, { comments });
    return response.data;
  },

  getRequestHistory: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/manager/history');
    return response.data;
  },

  // Leave Balance
  getLeaveBalance: async (): Promise<LeaveBalance[]> => {
    const response = await api.get('/employee/balance');
    return response.data;
  },
};