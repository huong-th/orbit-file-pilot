
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: Cookies.get('access_token') || null,
  refreshToken: Cookies.get('refresh_token') || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!Cookies.get('access_token'),
};

// Helper function to set secure cookies
const setSecureCookies = (accessToken: string, refreshToken?: string) => {
  const cookieOptions = {
    expires: 7, // 7 days
    secure: window.location.protocol === 'https:',
    sameSite: 'strict' as const
  };
  
  Cookies.set('access_token', accessToken, cookieOptions);
  if (refreshToken) {
    Cookies.set('refresh_token', refreshToken, cookieOptions);
  }
};

// Helper function to clear cookies
const clearCookies = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
};

// Async thunk for email + password login
export const loginWithPassword = createAsyncThunk(
  'auth/loginWithPassword',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.loginPassword(credentials.email, credentials.password);
      
      // Set secure cookies
      setSecureCookies(response.access_token, response.refresh_token);
      
      return response;
    } catch (error: any) {
      clearCookies();
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Login failed. Please check your credentials.'
      );
    }
  }
);

// Async thunk for Google OAuth login
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authApi.loginGoogle(token);
      
      // Set secure cookies
      setSecureCookies(response.access_token, response.refresh_token);
      
      return response;
    } catch (error: any) {
      clearCookies();
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Google login failed.'
      );
    }
  }
);

// Async thunk for OTP login
export const loginWithOTP = createAsyncThunk(
  'auth/loginWithOTP',
  async (credentials: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.loginOtp(credentials.email, credentials.otp);
      
      // Set secure cookies
      setSecureCookies(response.access_token, response.refresh_token);
      
      return response;
    } catch (error: any) {
      clearCookies();
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'OTP login failed.'
      );
    }
  }
);

// Async thunk for WebAuthn login
export const loginWithWebAuthn = createAsyncThunk(
  'auth/loginWithWebAuthn',
  async (credentials: { email: string; options: { type: 'register' | 'authenticate' }; credential: any }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyWebAuthn(
        credentials.email, 
        credentials.options, 
        credentials.credential
      );
      
      // Set secure cookies
      setSecureCookies(response.access_token, response.refresh_token);
      
      return response;
    } catch (error: any) {
      clearCookies();
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'WebAuthn login failed.'
      );
    }
  }
);

// Async thunk for requesting OTP
export const requestOTP = createAsyncThunk(
  'auth/requestOTP',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authApi.requestOtp(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to send OTP.'
      );
    }
  }
);

// Async thunk for getting user profile
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to get user profile.'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      clearCookies();
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTokens: (state, action: PayloadAction<{ access_token: string; refresh_token?: string }>) => {
      state.accessToken = action.payload.access_token;
      if (action.payload.refresh_token) {
        state.refreshToken = action.payload.refresh_token;
      }
      state.isAuthenticated = true;
      setSecureCookies(action.payload.access_token, action.payload.refresh_token);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Password login
    builder
      .addCase(loginWithPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Google login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // OTP login
    builder
      .addCase(loginWithOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // WebAuthn login
    builder
      .addCase(loginWithWebAuthn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithWebAuthn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithWebAuthn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Request OTP
    builder
      .addCase(requestOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get user profile
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, updateTokens, setUser } = authSlice.actions;

// Legacy export for backward compatibility
export const loginUser = loginWithPassword;

export default authSlice.reducer;
