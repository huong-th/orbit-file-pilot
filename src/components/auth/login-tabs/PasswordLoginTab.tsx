import { yupResolver } from '@hookform/resolvers/yup';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const createLoginSchema = (t: any) =>
  yup.object().shape({
    email: yup
      .string()
      .required(t('login.errors.emailRequired'))
      .email(t('login.errors.emailInvalid')),
    password: yup
      .string()
      .required(t('login.errors.passwordRequired'))
      .min(6, t('login.errors.passwordMinLength')),
  });

interface LoginFormData {
  email: string;
  password: string;
}

interface PasswordLoginTabProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
  onForgotPassword: () => void;
  onGoogleLogin: (token: string) => Promise<void>;
}

const PasswordLoginTab: React.FC<PasswordLoginTabProps> = ({
  onSubmit,
  isLoading,
  onForgotPassword,
  onGoogleLogin,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(createLoginSchema(t)),
    mode: 'onBlur',
  });

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t('login.email')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={t('login.emailPlaceholder')}
              {...register('email')}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            {t('login.password')}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('login.passwordPlaceholder')}
              {...register('password')}
              className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="text-right">
          <Button
            type="button"
            variant="link"
            className="text-xs text-primary p-0 h-auto hover:underline"
            onClick={onForgotPassword}
          >
            {t('login.forgotPassword')}
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              {t('login.signingIn')}
            </div>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              {t('login.signIn')}
            </>
          )}
        </Button>
      </form>
      <div className="flex items-center text-gray-400 text-sm my-3">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="px-3">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const accessToken = credentialResponse.credential;
          await onGoogleLogin(accessToken);
        }}
        onError={() => {
          console.error('Google login failed');
        }}
      />
    </div>
  );
};

export default PasswordLoginTab;
