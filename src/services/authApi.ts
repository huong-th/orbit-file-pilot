
import api from './api';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    avatar: string;
  };
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

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

interface WebAuthnChallenge {
  challenge: string;
  allowCredentials?: any[];
  excludeCredentials?: any[];
}

export const authApi = {
  // Email + Password Login
  loginPassword: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login-password', {
      email,
      password,
    });
    return response.data;
  },

  // Google OAuth Login
  loginGoogle: async (token: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login-google', {
      token,
    });
    return response.data;
  },

  // OTP Login - Request OTP
  requestOtp: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/request-otp', {
      email,
    });
    return response.data;
  },

  // OTP Login - Verify OTP
  loginOtp: async (email: string, otp: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login-otp', {
      email,
      otp,
    });
    return response.data;
  },

  // WebAuthn - Generate Challenge
  generateWebAuthnChallenge: async (email: string, type: 'register' | 'authenticate'): Promise<WebAuthnChallenge> => {
    const response = await api.get(`/auth/webauthn/generate-challenge?email=${encodeURIComponent(email)}&type=${type}`);
    return response.data;
  },

  // WebAuthn - Verify Credential
  verifyWebAuthn: async (email: string, options: { type: 'register' | 'authenticate' }, credential: any): Promise<LoginResponse> => {
    const response = await api.post('/auth/webauthn/verify', {
      email,
      options,
      credential,
    });
    return response.data;
  },

  // Registration
  register: async (email: string, username: string, password: string): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', {
      email,
      username,
      password,
    });
    return response.data;
  },

  // Email Verification
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  // Legacy methods for compatibility
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return authApi.loginPassword(email, password);
  },

  getProfile: async (accessToken?: string): Promise<UserProfile> => {
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
