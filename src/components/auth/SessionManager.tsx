import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getUserProfile, setUser, updateTokens } from '@/store/slices/authSlice.ts';
import Cookies from 'js-cookie';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, accessToken } = useAppSelector((state) => state.auth);

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
          const resultAction = await dispatch(getUserProfile());
          if (getUserProfile.fulfilled.match(resultAction)) {
            dispatch(setUser(resultAction.payload));
          }
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
