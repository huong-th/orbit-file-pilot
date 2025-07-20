import Cookies from 'js-cookie';
import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateTokens } from '@/store/slices/authSlice.ts';
import { fetchUserProfile } from '@/store/slices/userProfileSlice';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);
  const { user } = useAppSelector((state) => state.userProfile);

  // Listen for authentication state changes and fetch user profile
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    const initializeSession = async () => {
      const cookieAccessToken = Cookies.get('access_token');
      const cookieRefreshToken = Cookies.get('refresh_token');

      // If we have a token in cookies but not in Redux state, restore it
      if (cookieAccessToken && !isAuthenticated) {
        dispatch(
          updateTokens({
            access_token: cookieAccessToken,
            refresh_token: cookieRefreshToken,
          })
        );
      }

      // If we're authenticated but don't have user data, fetch it
      if ((isAuthenticated || cookieAccessToken) && !user) {
        try {
          await dispatch(fetchUserProfile());
        } catch (error) {
          console.log('Session validation failed, token may have expired');
        }
      }
    };

    initializeSession();
  }, [dispatch, isAuthenticated, user, accessToken]);

  return <>{children}</>;
};

export default SessionManager;
