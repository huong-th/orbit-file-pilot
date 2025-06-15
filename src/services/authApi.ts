import api from './api';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async (accessToken?: string): Promise<UserProfile> => {
    // If accessToken is provided, use it directly (for initial login)
    // Otherwise, the interceptor will add the token from cookies
    const config = accessToken ? {
      headers: { Authorization: `Bearer ${accessToken}` }
    } : {};
    
    const response = await api.get('/auth/profile', config);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post('/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  },
};