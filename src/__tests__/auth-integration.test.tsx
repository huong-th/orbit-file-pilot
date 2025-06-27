
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import LoginForm from '../components/auth/LoginForm';
import Cookies from 'js-cookie';
import { authApi } from '../services/authApi';

// Mock dependencies
jest.mock('js-cookie');
jest.mock('../services/authApi');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options) {
        let translation = key;
        Object.keys(options).forEach(optionKey => {
          translation = translation.replace(`{{${optionKey}}}`, options[optionKey]);
        });
        return translation;
      }
      return key;
    },
  }),
}));

const mockCookies = Cookies as jest.Mocked<typeof Cookies>;
const mockAuthApi = authApi as jest.Mocked<typeof authApi>;

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createTestStore();
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.get.mockReturnValue(undefined);
  });

  it('should write cookies and navigate on successful login', async () => {
    const mockLoginResponse = {
      access_token: 'test_access_token',
      refresh_token: 'test_refresh_token',
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        avatar: 'avatar.jpg',
      },
    };

    mockAuthApi.loginPassword.mockResolvedValue(mockLoginResponse);

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Fill in the form
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for the login to complete
    await waitFor(() => {
      expect(mockAuthApi.loginPassword).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    // Verify cookies were set
    expect(mockCookies.set).toHaveBeenCalledWith(
      'access_token',
      'test_access_token',
      expect.objectContaining({
        expires: 7,
        secure: false, // false in test environment
        sameSite: 'strict',
      })
    );

    expect(mockCookies.set).toHaveBeenCalledWith(
      'refresh_token',
      'test_refresh_token',
      expect.objectContaining({
        expires: 7,
        secure: false,
        sameSite: 'strict',
      })
    );
  });

  it('should clear cookies on logout', async () => {
    // Set up initial authenticated state
    mockCookies.get.mockImplementation((name) => {
      if (name === 'access_token') return 'test_token';
      if (name === 'refresh_token') return 'test_refresh';
      return undefined;
    });

    const store = createTestStore();
    
    // Dispatch logout action
    store.dispatch({ type: 'auth/logout' });

    // Verify cookies were cleared
    expect(mockCookies.remove).toHaveBeenCalledWith('access_token');
    expect(mockCookies.remove).toHaveBeenCalledWith('refresh_token');

    // Verify state was cleared
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should restore authentication state from cookies on page refresh', () => {
    mockCookies.get.mockImplementation((name) => {
      if (name === 'access_token') return 'stored_access_token';
      if (name === 'refresh_token') return 'stored_refresh_token';
      return undefined;
    });

    const store = createTestStore();
    const initialState = store.getState().auth;

    // The initial state should be restored from cookies
    expect(initialState.accessToken).toBe('stored_access_token');
    expect(initialState.refreshToken).toBe('stored_refresh_token');
    expect(initialState.isAuthenticated).toBe(true);
  });
});
