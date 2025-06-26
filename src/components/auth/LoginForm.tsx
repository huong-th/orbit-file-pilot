
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Smartphone, Fingerprint } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { authApi } from '../../services/authApi';
import ForgotPasswordModal from './ForgotPasswordModal';
import LoginHeader from './LoginHeader';
import PasswordLoginTab from './login-tabs/PasswordLoginTab';
import GoogleLoginTab from './login-tabs/GoogleLoginTab';
import OTPLoginTab from './login-tabs/OTPLoginTab';
import FingerprintLoginTab from './login-tabs/FingerprintLoginTab';

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
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<LoginMethod>('password');
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email');
  const [otpValue, setOtpValue] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const onPasswordSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authApi.loginPassword(data.email, data.password);
      
      toast({
        title: t('login.success.loginSuccess'),
        description: t('login.success.welcomeBack', { name: result.user.name }),
      });
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPEmailSubmit = async (data: OTPEmailData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authApi.requestOtp(data.email);
      
      setOtpEmail(data.email);
      setOtpStep('otp');
      toast({
        title: t('login.success.otpSent'),
        description: t('login.success.otpSentDescription', { email: data.email }),
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send OTP';
      setError(errorMessage);
      toast({
        title: 'OTP Request Failed',
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = async (value: string) => {
    setOtpValue(value);
    if (value.length === 6) {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await authApi.loginOtp(otpEmail, value);
        
        toast({
          title: t('login.success.loginSuccess'),
          description: t('login.success.otpSuccess'),
        });
        navigate('/dashboard');
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Invalid OTP';
        setError(errorMessage);
        toast({
          title: t('login.error.invalidOtp'),
          description: errorMessage,
          variant: "destructive",
        });
        setOtpValue('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    // This would typically open Google OAuth popup
    // For now, we'll show a placeholder message
    toast({
      title: t('login.google'),
      description: 'Google OAuth integration would be implemented here with your API',
    });
  };

  const handleFingerprintLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // For demo, we'll use a placeholder email - in real app you'd collect this
      const email = 'demo@example.com';
      
      // Generate challenge
      const challenge = await authApi.generateWebAuthnChallenge(email, 'authenticate');
      
      // Get credential from browser
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(challenge.challenge),
          allowCredentials: challenge.allowCredentials || [],
          timeout: 60000,
        }
      });

      if (credential) {
        // Verify with your API
        const result = await authApi.verifyWebAuthn(email, { type: 'authenticate' }, credential);
        
        toast({
          title: t('login.success.fingerprintSuccess'),
          description: t('login.success.fingerprintSuccessDescription'),
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Fingerprint authentication failed';
      setError(errorMessage);
      toast({
        title: t('login.error.fingerprintFailed'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetOTPFlow = () => {
    setOtpStep('email');
    setOtpValue('');
    setOtpEmail('');
  };

  // Clear error when switching tabs
  React.useEffect(() => {
    setError(null);
  }, [activeTab]);

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/40 shadow-2xl">
          <LoginHeader />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Methods Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LoginMethod)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="password" className="text-xs">
                <Mail className="w-3 h-3 mr-1" />
                Email
              </TabsTrigger>
              <TabsTrigger value="google" className="text-xs">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
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

            <TabsContent value="password" className="space-y-6 animate-fade-in">
              <PasswordLoginTab
                onSubmit={onPasswordSubmit}
                isLoading={isLoading}
                onForgotPassword={() => setForgotPasswordOpen(true)}
              />
            </TabsContent>

            <TabsContent value="google" className="space-y-6 animate-fade-in">
              <GoogleLoginTab
                onGoogleLogin={handleGoogleLogin}
                isLoading={isLoading}
              />
            </TabsContent>

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
              <Button 
                variant="link" 
                className="text-xs text-primary p-0 h-auto hover:underline"
                onClick={() => navigate('/register')}
              >
                Sign up here
              </Button>
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        open={forgotPasswordOpen} 
        onOpenChange={setForgotPasswordOpen} 
      />
    </>
  );
};

export default LoginForm;
