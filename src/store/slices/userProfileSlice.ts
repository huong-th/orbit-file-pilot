import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { authApi } from '@/services/authApi';
import { UserProfile } from '@/types/auth';
import { logout } from './authSlice';

interface UserProfileState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: UserProfileState = {
  user: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to fetch user profile.'
      );
    }
  }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'userProfile/updateUserProfile',
  async (
    profileData: { username?: string; email?: string; avatar?: File },
    { rejectWithValue }
  ) => {
    try {
      // This would be implemented with your actual API
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Return the updated profile data (map username to name for UserProfile type)
      return {
        name: profileData.username,
        email: profileData.email,
        avatar: profileData.avatar ? 'updated-avatar-url' : undefined,
        updatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to update user profile.'
      );
    }
  }
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.user = null;
      state.error = null;
      state.lastUpdated = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      state.lastUpdated = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && action.payload) {
          // Only update fields that were provided
          if (action.payload.name !== undefined) state.user.name = action.payload.name;
          if (action.payload.email !== undefined) state.user.email = action.payload.email;
          if (action.payload.avatar !== undefined) state.user.avatar = action.payload.avatar;
        }
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Clear user profile on logout
      .addCase(logout, (state) => {
        state.user = null;
        state.error = null;
        state.lastUpdated = null;
        state.isLoading = false;
      });
  },
});

export const { clearUserProfile, clearError, setUser } = userProfileSlice.actions;
export default userProfileSlice.reducer;