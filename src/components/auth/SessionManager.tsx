import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { authApi } from '../../services/authApi';
import { updateTokens } from '../../store/authSlice';
import Cookies from 'js-cookie';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initializeSession = async () => {
      const accessToken = Cookies.get('access_token');
      
      if (accessToken && !isAuthenticated && !user) {
        try {
          // Try to get user profile to verify token is still valid
          const userProfile = await authApi.getProfile();
          
          // If successful, update Redux state with existing tokens
          dispatch(updateTokens({
            access_token: accessToken,
            refresh_token: Cookies.get('refresh_token'),
          }));
          
          // Also store user profile
          dispatch({
            type: 'auth/loginUser/fulfilled',
            payload: {
              tokens: {
                access_token: accessToken,
                refresh_token: Cookies.get('refresh_token') || '',
              },
              user: userProfile,
            },
          });
        } catch (error) {
          // If token is invalid, the API interceptor will handle cleanup
          console.log('Session validation failed, token may have expired');
        }
      }
    };

    initializeSession();
  }, [dispatch, isAuthenticated, user]);

  return <>{children}</>;
};

export default SessionManager;