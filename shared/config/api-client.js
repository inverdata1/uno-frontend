import axios from 'axios';

// API base URL - will be configured per environment
const API_BASE_URL = 'https://api.uno-delivery.com'; // Replace with your FastAPI backend URL

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Handle auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    try {

      // Get Firebase Auth token when available (for real backend)
      // TODO: Integrate with Firebase Auth when implemented
      // const user = auth.currentUser;
      // if (user) {
      //   const token = await user.getIdToken();
      //   config.headers.Authorization = `Bearer ${token}`;
      // }

      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);

    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // TODO: Handle unauthorized - redirect to login
      console.warn('🔐 Unauthorized - redirecting to login');
    }

    if (error.response?.status >= 500) {
      console.error('🔥 Server error - showing user-friendly message');
    }

    return Promise.reject(error);
  }
);

export default apiClient;