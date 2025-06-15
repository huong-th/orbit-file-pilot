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

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const loginResponse = await authApi.login(credentials.email, credentials.password);
      
      // Store tokens in httpOnly cookies
      Cookies.set('access_token', loginResponse.access_token, { 
        expires: 7, // 7 days
        secure: true,
        sameSite: 'strict'
      });
      Cookies.set('refresh_token', loginResponse.refresh_token, { 
        expires: 7, // 7 days
        secure: true,
        sameSite: 'strict'
      });
      
      // Get user profile
      const userProfile = await authApi.getProfile(loginResponse.access_token);
      
      return {
        tokens: loginResponse,
        user: userProfile,
      };
    } catch (error: any) {
      // Clear any existing tokens on login failure
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Login failed. Please check your credentials.'
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
      // Clear cookies
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.tokens.access_token;
        state.refreshToken = action.payload.tokens.refresh_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, updateTokens } = authSlice.actions;
export default authSlice.reducer;