import axios from 'axios';

/**
 * Unified Portal API Service
 * Handles communication with API Gateway
 */

const API_BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:6000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication APIs
 */
export const authAPI = {
  login: (email, password) =>
    api.post('/gateway/auth/login', { email, password }),

  verify: (token) =>
    api.get('/gateway/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    }),

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('services');
  }
};

/**
 * Hospital APIs
 */
export const hospitalAPI = {
  getDoctors: () =>
    api.get('/gateway/hospital/hr/doctors'),

  getDoctorsByDepartment: (dept) =>
    api.get(`/gateway/hospital/doctors/department/${dept}`),

  getDepartments: () =>
    api.get('/gateway/hospital/hr/departments'),

  createDoctor: (doctorData) =>
    api.post('/gateway/hospital/hr/doctors', doctorData),

  updateDoctor: (id, doctorData) =>
    api.put(`/gateway/hospital/hr/doctors/${id}`, doctorData),

  deleteDoctor: (id) =>
    api.delete(`/gateway/hospital/hr/doctors/${id}`)
};

/**
 * HR APIs
 */
export const hrAPI = {
  getEmployees: () =>
    api.get('/gateway/hr/employees'),

  getEmployee: (id) =>
    api.get(`/gateway/hr/employees/${id}`),

  createEmployee: (employeeData) =>
    api.post('/gateway/hr/employees', employeeData),

  getDepartments: () =>
    api.get('/gateway/hr/departments'),

  getSpecializations: () =>
    api.get('/gateway/hr/specializations')
};

/**
 * Sync APIs
 */
export const syncAPI = {
  syncHRToHospital: () =>
    api.post('/gateway/sync/hr-to-hospital'),

  getSyncStatus: () =>
    api.get('/gateway/sync/status')
};

/**
 * Hotel APIs (for future use)
 */
export const hotelAPI = {
  getRooms: () =>
    api.get('/gateway/hotel/rooms'),

  bookRoom: (bookingData) =>
    api.post('/gateway/hotel/bookings', bookingData)
};

/**
 * Gateway Health Check
 */
export const gatewayAPI = {
  health: () =>
    api.get('/gateway/health'),

  systems: () =>
    api.get('/gateway/systems')
};

export default api;
