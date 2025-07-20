import React, { useEffect } from 'react';

import AccountSettingsForm from '@/components/settings/AccountSettingsForm';
import { useAppDispatch } from '@/hooks/redux';
import { fetchUserProfile } from '@/store/slices/userProfileSlice';

const AccountSettings: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Fetch user profile every time the settings screen is visited
    dispatch(fetchUserProfile());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background py-8 px-4 xl:px-8">
      <div className="max-w-[640px] mx-auto">
        <h1 className="text-3xl font-semibold text-foreground mb-8">Account Settings</h1>
        <AccountSettingsForm />
      </div>
    </div>
  );
};

export default AccountSettings;
