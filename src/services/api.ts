import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { store } from '../store/store';
import { logout } from '../store/authSlice';

const API_BASE_URL = 'https://api.escuelajs.co/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refresh_token');
      
      if (refreshToken) {
        try {
          // Try to refresh the token
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { access_token } = refreshResponse.data;

          // Update the access token in cookies
          Cookies.set('access_token', access_token, {
            expires: 7,
            secure: true,
            sameSite: 'strict'
          });

          // Update the authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          // Retry the original request with the new token
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout the user
          store.dispatch(logout());
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout the user
        store.dispatch(logout());
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;