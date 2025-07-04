import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  loginWithPassword,
  loginWithOTP,
  loginWithWebAuthn,
  requestOTP,
  clearError,
  loginWithGoogle,
} from '@/store/slices/authSlice';
import { Mail, Smartphone, Fingerprint } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import LoginHeader from '@/components/auth/LoginHeader';
import PasswordLoginTab from '@/components/auth/login-tabs/PasswordLoginTab';
import OTPLoginTab from '@/components/auth/login-tabs/OTPLoginTab';
import FingerprintLoginTab from '@/components/auth/login-tabs/FingerprintLoginTab';

interface LoginFormData {
  email: string;
  password: string;
}

interface OTPEmailData {
  email: string;
}

type LoginMethod = 'password' | 'google' | 'otp' | 'fingerprint';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { isLoading, error: authError } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<LoginMethod>('password');
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email');
  const [otpValue, setOtpValue] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const onPasswordSubmit = async (data: LoginFormData) => {
    try {
      const resultAction = await dispatch(loginWithPassword(data));

      if (loginWithPassword.fulfilled.match(resultAction)) {
        toast({
          title: t('login.success.loginSuccess'),
          description: t('login.success.welcomeBack', { name: resultAction.payload.user.name }),
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: resultAction.payload as string,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const onOTPEmailSubmit = async (data: OTPEmailData) => {
    try {
      const resultAction = await dispatch(requestOTP(data.email));

      if (requestOTP.fulfilled.match(resultAction)) {
        setOtpEmail(data.email);
        setOtpStep('otp');
        toast({
          title: t('login.success.otpSent'),
          description: t('login.success.otpSentDescription', { email: data.email }),
        });
      } else {
        toast({
          title: 'OTP Request Failed',
          description: resultAction.payload as string,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'OTP Request Failed',
        description: err.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    }
  };

  const handleOTPComplete = async (value: string) => {
    setOtpValue(value);
    if (value.length === 6) {
      try {
        const resultAction = await dispatch(loginWithOTP({ email: otpEmail, otp: value }));

        if (loginWithOTP.fulfilled.match(resultAction)) {
          toast({
            title: t('login.success.loginSuccess'),
            description: t('login.success.otpSuccess'),
          });
          navigate('/dashboard');
        } else {
          toast({
            title: t('login.error.invalidOtp'),
            description: resultAction.payload as string,
            variant: 'destructive',
          });
          setOtpValue('');
        }
      } catch (err: any) {
        toast({
          title: t('login.error.invalidOtp'),
          description: err.message || 'Invalid OTP',
          variant: 'destructive',
        });
        setOtpValue('');
      }
    }
  };

  const handleGoogleLogin = async (token: string) => {
    try {
      const resultAction = await dispatch(loginWithGoogle(token));

      if (loginWithGoogle.fulfilled.match(resultAction)) {
        toast({
          title: 'Login Successful',
          description: `Welcome, ${resultAction.payload.user.name}`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Google Login Failed',
          description: resultAction.payload as string,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Google Login Failed',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleFingerprintLogin = async () => {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Để demo, chúng ta sẽ sử dụng một email giả định
      // Trong ứng dụng thật, bạn sẽ lấy email từ trường input hoặc từ một nguồn khác
      const email = 'john.doe@example.com'; // Thay thế bằng email người dùng thực tế

      if (!email) {
        toast({
          title: 'Error',
          description: 'Please enter your email to use fingerprint login.',
          variant: 'destructive',
        });
        return;
      }

      // Dispatch thunk loginWithWebAuthn để xử lý toàn bộ luồng xác thực
      const resultAction = await dispatch(loginWithWebAuthn(email));

      if (loginWithWebAuthn.fulfilled.match(resultAction)) {
        toast({
          title: t('login.success.fingerprintSuccess'),
          description: t('login.success.fingerprintSuccessDescription'),
        });
        navigate('/dashboard');
      } else {
        toast({
          title: t('login.error.fingerprintFailed'),
          description: resultAction.payload as string,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: t('login.error.fingerprintFailed'),
        description: err.message || 'Fingerprint authentication failed',
        variant: 'destructive',
      });
    }
  };

  const resetOTPFlow = () => {
    setOtpStep('email');
    setOtpValue('');
    setOtpEmail('');
  };

  // Clear error when switching tabs
  React.useEffect(() => {
    dispatch(clearError());
  }, [activeTab, dispatch]);

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/40 shadow-2xl">
          <LoginHeader />

          {/* Error Alert */}
          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {/* Login Methods Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as LoginMethod)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="password" className="text-xs">
                <Mail className="w-3 h-3 mr-1" />
                Email
              </TabsTrigger>
              <TabsTrigger value="otp" className="text-xs">
                <Smartphone className="w-3 h-3 mr-1" />
                OTP
              </TabsTrigger>
              <TabsTrigger value="fingerprint" className="text-xs">
                <Fingerprint className="w-3 h-3 mr-1" />
                Touch
              </TabsTrigger>
            </TabsList>

            {/* Password Login */}
            <TabsContent value="password" className="space-y-6 animate-fade-in">
              <PasswordLoginTab
                onSubmit={onPasswordSubmit}
                isLoading={isLoading}
                onForgotPassword={() => setForgotPasswordOpen(true)}
                onGoogleLogin={handleGoogleLogin}
              />
            </TabsContent>

            {/* OTP Login */}
            <TabsContent value="otp" className="space-y-6 animate-fade-in">
              <OTPLoginTab
                otpStep={otpStep}
                otpValue={otpValue}
                otpEmail={otpEmail}
                isLoading={isLoading}
                onOTPEmailSubmit={onOTPEmailSubmit}
                onOTPComplete={handleOTPComplete}
                onResetOTPFlow={resetOTPFlow}
              />
            </TabsContent>

            {/* Fingerprint Login */}
            <TabsContent value="fingerprint" className="space-y-6 animate-fade-in">
              <FingerprintLoginTab
                onFingerprintLogin={handleFingerprintLogin}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-xs text-primary p-0 h-auto hover:underline cursor-pointer"
                onClick={() => navigate('/register')}
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </>
  );
};

export default LoginForm;
