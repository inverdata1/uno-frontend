import axios from 'axios';
import { firebaseClient } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './api-config';

// Configuration flags
const USE_FIREBASE = false; // Set to false to route requests to NestJS backend via Axios
const API_BASE_URL = API_CONFIG.baseURL; 

/**
 * Unified API client
 */

// Create axios instance for direct external requests if needed
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Axios interceptors
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log(`🚀 HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    console.log(`✅ HTTP Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ HTTP Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);

    if (error.response?.status === 401) {
      console.warn('🔐 Unauthorized - clearing token and redirecting to login');
      // Clear storage so we don't get stuck in a loop of trying to use an invalid token
      AsyncStorage.removeItem('userToken').catch(() => {});
      AsyncStorage.removeItem('userId').catch(() => {});
      // TODO: Handle unauthorized (e.g. event emitter to logout)
    }

    return Promise.reject(error);
  }
);

/**
 * Get current user ID (reads from AsyncStorage now)
 */
const getCurrentUserId = async () => {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
};

/**
 * Check if operation requires authentication
 */
const requiresAuth = (url, method) => {
  if (method.toLowerCase() === 'post' && url === '/users') return false;
  if (method.toLowerCase() === 'post' && url.startsWith('/auth/')) return false;

  const publicReadEndpoints = [
    '/posts',
    '/products',
    '/categories',
    '/stories',
    '/businesses'
  ];

  if (method.toLowerCase() === 'get') {
    for (const endpoint of publicReadEndpoints) {
      if (url.startsWith(endpoint)) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Main API client - switches between Firebase and HTTP based on USE_FIREBASE flag
 */
export const apiClient = {
  async get(url, config = {}) {
    if (USE_FIREBASE) {
      const params = { ...config.params };
      if (requiresAuth(url, 'get')) {
        params.userId = await getCurrentUserId();
      }

      const data = await firebaseClient.get(url, params);
      return { data };
    }

    return axiosClient.get(url, config);
  },

  async post(url, data, config = {}) {
    if (USE_FIREBASE) {
      const params = { ...config.params };
      if (requiresAuth(url, 'post')) {
        params.userId = await getCurrentUserId();
      }

      const responseData = await firebaseClient.post(url, data, params);
      return { data: responseData };
    }

    return axiosClient.post(url, data, config);
  },

  async put(url, data, config = {}) {
    if (USE_FIREBASE) {
      const params = { ...config.params };
      if (requiresAuth(url, 'put')) {
        params.userId = await getCurrentUserId();
      }

      const responseData = await firebaseClient.put(url, data, params);
      return { data: responseData };
    }

    return axiosClient.put(url, data, config);
  },

  async patch(url, data, config = {}) {
    if (USE_FIREBASE) {
      const params = { ...config.params };
      if (requiresAuth(url, 'patch')) {
        params.userId = await getCurrentUserId();
      }

      const responseData = await firebaseClient.patch(url, data, params);
      return { data: responseData };
    }

    return axiosClient.patch(url, data, config);
  },

  async delete(url, config = {}) {
    if (USE_FIREBASE) {
      const params = { ...config.params };
      if (requiresAuth(url, 'delete')) {
        params.userId = await getCurrentUserId();
      }

      const responseData = await firebaseClient.delete(url, params);
      return { data: responseData };
    }

    return axiosClient.delete(url, config);
  }
};

// Export configuration for debugging
export { USE_FIREBASE };

// Export default for backward compatibility
export default apiClient;