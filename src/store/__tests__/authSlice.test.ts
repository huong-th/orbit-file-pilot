
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { 
  logout, 
  clearError, 
  updateTokens, 
  setUser,
  loginWithPassword 
} from '../authSlice';
import Cookies from 'js-cookie';

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

const mockCookies = Cookies as jest.Mocked<typeof Cookies>;

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle logout', () => {
      const initialState = {
        user: { id: 1, email: 'test@example.com', name: 'Test', role: 'user', avatar: '' },
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      store.dispatch({ type: 'auth/logout' });
      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
      expect(mockCookies.remove).toHaveBeenCalledWith('access_token');
      expect(mockCookies.remove).toHaveBeenCalledWith('refresh_token');
    });

    it('should handle clearError', () => {
      // Set initial error state
      store.dispatch({ type: 'auth/loginWithPassword/rejected', payload: 'Test error' });
      
      // Clear error
      store.dispatch(clearError());
      const state = store.getState().auth;

      expect(state.error).toBeNull();
    });

    it('should handle updateTokens', () => {
      const tokens = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      };

      store.dispatch(updateTokens(tokens));
      const state = store.getState().auth;

      expect(state.accessToken).toBe('new_access_token');
      expect(state.refreshToken).toBe('new_refresh_token');
      expect(state.isAuthenticated).toBe(true);
      expect(mockCookies.set).toHaveBeenCalledWith('access_token', 'new_access_token', expect.any(Object));
      expect(mockCookies.set).toHaveBeenCalledWith('refresh_token', 'new_refresh_token', expect.any(Object));
    });

    it('should handle setUser', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        avatar: 'avatar.jpg',
      };

      store.dispatch(setUser(user));
      const state = store.getState().auth;

      expect(state.user).toEqual(user);
    });
  });

  describe('async thunks', () => {
    it('should handle loginWithPassword.pending', () => {
      store.dispatch({ type: 'auth/loginWithPassword/pending' });
      const state = store.getState().auth;

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle loginWithPassword.rejected', () => {
      const errorMessage = 'Login failed';
      store.dispatch({ 
        type: 'auth/loginWithPassword/rejected', 
        payload: errorMessage 
      });
      const state = store.getState().auth;

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle loginWithPassword.fulfilled', () => {
      const payload = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          avatar: 'avatar.jpg',
        },
      };

      store.dispatch({ 
        type: 'auth/loginWithPassword/fulfilled', 
        payload 
      });
      const state = store.getState().auth;

      expect(state.isLoading).toBe(false);
      expect(state.accessToken).toBe('access_token');
      expect(state.refreshToken).toBe('refresh_token');
      expect(state.user).toEqual(payload.user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });
  });
});
