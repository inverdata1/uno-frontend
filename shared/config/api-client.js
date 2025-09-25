import axios from 'axios';
import { firebaseClient } from '../api';
import { auth } from './firebase';

// Configuration flags
const USE_FIREBASE = true; // Set to false when you have real backend
const API_BASE_URL = 'https://api.uno-delivery.com'; // Your future backend URL

/**
 * Unified API client that can switch between Firebase and real backend
 * When USE_FIREBASE is true, routes requests to Firebase adapter
 * When USE_FIREBASE is false, uses axios for HTTP requests
 */

// Create axios instance for future backend use
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Axios interceptors (for future backend)
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      // Get Firebase Auth token for backend authentication
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
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
      console.warn('🔐 Unauthorized - redirecting to login');
      // TODO: Handle unauthorized
    }

    return Promise.reject(error);
  }
);

/**
 * Get current user ID for Firebase operations
 */
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

/**
 * Main API client - switches between Firebase and HTTP based on USE_FIREBASE flag
 */
export const apiClient = {
  async get(url, config = {}) {
    if (USE_FIREBASE) {
      // Add userId to params for Firebase operations
      const params = {
        ...config.params,
        userId: getCurrentUserId()
      };

      const data = await firebaseClient.get(url, params);
      return { data };
    }

    return axiosClient.get(url, config);
  },

  async post(url, data, config = {}) {
    if (USE_FIREBASE) {
      const params = {
        ...config.params,
        userId: getCurrentUserId()
      };

      const responseData = await firebaseClient.post(url, data, params);
      return { data: responseData };
    }

    return axiosClient.post(url, data, config);
  },

  async put(url, data, config = {}) {
    if (USE_FIREBASE) {
      const params = {
        ...config.params,
        userId: getCurrentUserId()
      };

      const responseData = await firebaseClient.put(url, data, params);
      return { data: responseData };
    }

    return axiosClient.put(url, data, config);
  },

  async patch(url, data, config = {}) {
    if (USE_FIREBASE) {
      const params = {
        ...config.params,
        userId: getCurrentUserId()
      };

      const responseData = await firebaseClient.patch(url, data, params);
      return { data: responseData };
    }

    return axiosClient.patch(url, data, config);
  },

  async delete(url, config = {}) {
    if (USE_FIREBASE) {
      const params = {
        ...config.params,
        userId: getCurrentUserId()
      };

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