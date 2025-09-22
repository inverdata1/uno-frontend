import axios from 'axios';
import { mockApiCall, USE_MOCK_BACKEND } from './mock-backend';

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

// Request interceptor - Handle mock backend and auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Check if we should use mock backend
      if (USE_MOCK_BACKEND) {
        console.log(`🎭 Intercepting for mock: ${config.method?.toUpperCase()} ${config.url}`);

        // Call mock backend and throw to skip real request
        const mockResponse = await mockApiCall(
          config.method?.toUpperCase(),
          config.url,
          config.data,
          config.params
        );

        if (mockResponse) {
          // Create a fake axios response structure
          const fakeResponse = {
            data: mockResponse.data,
            status: mockResponse.status,
            statusText: mockResponse.statusText,
            headers: mockResponse.headers,
            config,
            request: {}
          };

          // Throw the response to be caught by the response interceptor
          throw { mockResponse: fakeResponse };
        }
      }

      // Get Firebase Auth token when available (for real backend)
      // TODO: Integrate with Firebase Auth when implemented
      // const user = auth.currentUser;
      // if (user) {
      //   const token = await user.getIdToken();
      //   config.headers.Authorization = `Bearer ${token}`;
      // }

      console.log(`🚀 Real API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      // If it's a mock response, re-throw it
      if (error.mockResponse) {
        throw error;
      }
      console.error('❌ Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle mock responses and errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle mock responses (they come as errors from request interceptor)
    if (error.mockResponse) {
      console.log(`✅ Mock Response: ${error.mockResponse.status}`);
      return Promise.resolve(error.mockResponse);
    }

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