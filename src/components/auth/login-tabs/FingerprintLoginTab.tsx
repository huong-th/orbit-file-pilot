import React from 'react';
import { useTranslation } from 'react-i18next';
import { Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FingerprintLoginTabProps {
  onFingerprintLogin: () => Promise<void>;
  isLoading: boolean;
}

const FingerprintLoginTab: React.FC<FingerprintLoginTabProps> = ({
  onFingerprintLogin,
  isLoading,
}) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-8">
      <div
        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover-scale cursor-pointer"
        onClick={onFingerprintLogin}
      >
        <Fingerprint className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Touch to Login</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Place your finger on the sensor to authenticate
      </p>
      <Button
        onClick={onFingerprintLogin}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 transition-all hover-scale"
        disabled={isLoading}
      >
        <Fingerprint className="w-4 h-4 mr-2" />
        Authenticate with Fingerprint
      </Button>
    </div>
  );
};

export default FingerprintLoginTab;
