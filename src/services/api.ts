import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Khai báo một biến để giữ hàm dispatch của Redux
let reduxDispatch: any = null;

// Hàm để tiêm hàm dispatch của Redux
export const setReduxDispatch = (dispatch: any) => {
  reduxDispatch = dispatch;
};

// Request interceptor để thêm token xác thực
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
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { access_token } = refreshResponse.data;

          // Update the access token in cookies
          Cookies.set('access_token', access_token, {
            expires: 7, // 7 ngày
            secure: window.location.protocol === 'https:',
            sameSite: 'strict' as const,
          });

          // Update the authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          // Retry the original request with the new token
          return api(originalRequest);
        } catch (refreshError) {
          // Làm mới thất bại, xóa token và chuyển hướng đến trang đăng nhập
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          // Không cần gọi Redux dispatch trực tiếp ở đây,
          // SessionManager sẽ xử lý trạng thái Redux khi cookie bị xóa.
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // Không có refresh token, xóa token và chuyển hướng đến trang đăng nhập
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
