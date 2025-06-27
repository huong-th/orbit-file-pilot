import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';

const LoginHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
        <LogIn className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">
        {t('login.title')}
      </h1>
      <p className="text-muted-foreground">
        {t('login.subtitle')}
      </p>
    </div>
  );
};

export default LoginHeader;
