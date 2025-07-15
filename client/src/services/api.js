import axios from 'axios';

// Create an instance of axios with default config
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true
});

// Request interceptor for adding token to headers
api.interceptors.request.use(
  (config) => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);

    // Handle network errors (server not running or unreachable)
    if (!error.response) {
      console.error('Network Error: The server is unreachable or not responding');
      return Promise.reject({
        message: 'Server is unavailable. Please check your connection and try again.'
      });
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response && error.response.status === 401) {
      console.error('Authentication Error: Token invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?error=session_expired';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Patients API
export const patientsAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  create: (patientData) => api.post('/patients', patientData),
  update: (id, patientData) => api.put(`/patients/${id}`, patientData),
  delete: (id) => api.delete(`/patients/${id}`),
};

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (departmentData) => api.post('/departments', departmentData),
  update: (id, departmentData) => api.put(`/departments/${id}`, departmentData),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Tokens API
export const tokensAPI = {
  getAll: () => api.get('/tokens'),
  getById: (id) => api.get(`/tokens/${id}`),
  create: (tokenData) => api.post('/tokens', tokenData),
  update: (id, tokenData) => api.put(`/tokens/${id}`, tokenData),
  delete: (id) => api.delete(`/tokens/${id}`),
  getByDepartment: (departmentId) => api.get(`/tokens/department/${departmentId}`),
  getByPatient: (patientId) => api.get(`/tokens/patient/${patientId}`),
  nextToken: (departmentId) => api.put(`/tokens/next/${departmentId}`),
};

// Operation Theatre API
export const otAPI = {
  getAll: () => api.get('/ot'),
  getById: (id) => api.get(`/ot/${id}`),
  create: (scheduleData) => api.post('/ot', scheduleData),
  update: (id, scheduleData) => api.put(`/ot/${id}`, scheduleData),
  delete: (id) => api.delete(`/ot/${id}`),
  getByDate: (date) => api.get(`/ot/date/${date}`),
};

// Pharmacy API
export const pharmacyAPI = {
  getDrugs: () => api.get('/pharmacy/drugs'),
  getDrugById: (id) => api.get(`/pharmacy/drugs/${id}`),
  createDrug: (drugData) => api.post('/pharmacy/drugs', drugData),
  updateDrug: (id, drugData) => api.put(`/pharmacy/drugs/${id}`, drugData),
  deleteDrug: (id) => api.delete(`/pharmacy/drugs/${id}`),
  searchDrugs: (query) => api.get(`/pharmacy/drugs/search?query=${query}`),
  getLowStock: () => api.get('/pharmacy/drugs/low-stock'),
};

export default {
  authAPI,
  usersAPI,
  patientsAPI,
  departmentsAPI,
  tokensAPI,
  otAPI,
  pharmacyAPI,
};
