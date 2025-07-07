import React from 'react';

import AccountSettingsForm from '@/components/settings/AccountSettingsForm';

const AccountSettings: React.FC = () => {
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
