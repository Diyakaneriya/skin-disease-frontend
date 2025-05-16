import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // To this (add /api prefix and match backend route):
  registerDoctor: async (formData) => {
    try {
      console.log('Sending doctor registration request to:', '/users/doctor/register');
      const response = await api.post('/users/doctor/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getAllUsers: async () => {
    try {
      const response = await api.get('/users/all');
      return response.data;
    } catch (error) {
      console.error('Error in getAllUsers:', error.message);
      // Check if it's an authentication or permission error
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (error.response.status === 403) {
          throw new Error('You do not have permission to access this resource.');
        }
      }
      throw error; // Re-throw the error for the component to handle
    }
  },

  getPendingDoctors: async () => {
    try {
      const response = await api.get('/users/doctors/pending');
      return response.data;
    } catch (error) {
      console.error('Error in getPendingDoctors:', error.message);
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (error.response.status === 403) {
          throw new Error('You do not have permission to access this resource.');
        }
      }
      throw error;
    }
  },

  updateDoctorStatus: async (doctorId, status) => {
    try {
      const response = await api.post('/users/doctor/approve', { doctorId, status });
      return response.data;
    } catch (error) {
      console.error('Error in updateDoctorStatus:', error.message);
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (error.response.status === 403) {
          throw new Error('You do not have permission to access this resource.');
        }
      }
      throw error;
    }
  }
};

// Image services
export const imageService = {
  uploadImage: async (formData) => {
    const response = await api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getUserImages: async () => {
    const response = await api.get('/images/user/me');
    return response.data;
  },

  getImageById: async (id) => {
    const response = await api.get(`/images/${id}`);
    return response.data;
  }
};

export default api;