import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, LogIn, Fingerprint, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { useToast } from '../../hooks/use-toast';
import { loginUser, clearError } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';

// Create validation schemas inside component to access t function
const createLoginSchema = (t: any) => yup.object().shape({
  email: yup
    .string()
    .required(t('login.errors.emailRequired'))
    .email(t('login.errors.emailInvalid')),
  password: yup
    .string()
    .required(t('login.errors.passwordRequired'))
    .min(6, t('login.errors.passwordMinLength')),
});

const createOtpEmailSchema = (t: any) => yup.object().shape({
  email: yup
    .string()
    .required(t('login.errors.emailRequired'))
    .email(t('login.errors.emailInvalid')),
});

interface LoginFormData {
  email: string;
  password: string;
}

interface OTPEmailData {
  email: string;
}

type LoginMethod = 'password' | 'google' | 'otp' | 'fingerprint';

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<LoginMethod>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email');
  const [otpValue, setOtpValue] = useState('');
  const [otpEmail, setOtpEmail] = useState('');

  // Password login form
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: yupResolver(createLoginSchema(t)),
    mode: 'onBlur',
  });

  // OTP email form
  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors },
    reset: resetOTP,
  } = useForm<OTPEmailData>({
    resolver: yupResolver(createOtpEmailSchema(t)),
    mode: 'onBlur',
  });

  const onPasswordSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(loginUser({ 
        email: data.email, 
        password: data.password 
      }));
      
      if (loginUser.fulfilled.match(result)) {
        toast({
          title: t('login.success.loginSuccess'),
          description: t('login.success.welcomeBack', { name: result.payload.user.name }),
        });
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is handled by the slice
    }
  };

  const onOTPEmailSubmit = (data: OTPEmailData) => {
    setOtpEmail(data.email);
    setOtpStep('otp');
    toast({
      title: t('login.success.otpSent'),
      description: t('login.success.otpSentDescription', { email: data.email }),
    });
  };

  const handleOTPComplete = (value: string) => {
    setOtpValue(value);
    if (value.length === 6) {
      // Simulate OTP verification
      if (value === '123456') {
        toast({
          title: t('login.success.loginSuccess'),
          description: t('login.success.otpSuccess'),
        });
        navigate('/dashboard');
      } else {
        toast({
          title: t('login.error.invalidOtp'),
          description: t('login.error.invalidOtpDescription'),
          variant: "destructive",
        });
        setOtpValue('');
      }
    }
  };

  const handleGoogleLogin = () => {
    toast({
      title: t('login.google'),
      description: t('login.success.googleSuccess'),
    });
  };

  const handleFingerprintLogin = () => {
    // Simulate fingerprint authentication with random success/failure
    const isSuccess = Math.random() > 0.3;
    
    setTimeout(() => {
      if (isSuccess) {
        toast({
          title: t('login.success.fingerprintSuccess'),
          description: t('login.success.fingerprintSuccessDescription'),
        });
        navigate('/dashboard');
      } else {
        toast({
          title: t('login.error.fingerprintFailed'),
          description: t('login.error.fingerprintFailedDescription'),
          variant: "destructive",
        });
      }
    }, 1500);
  };

  const resetOTPFlow = () => {
    setOtpStep('email');
    setOtpValue('');
    setOtpEmail('');
    resetOTP();
  };

  // Clear error when switching tabs or typing
  React.useEffect(() => {
    if (error) {
      dispatch(clearError());
      clearErrors();
    }
  }, [activeTab, error, dispatch, clearErrors]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/40 shadow-2xl">
        {/* Header */}
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

          {/* Password Login */}
          <TabsContent value="password" className="space-y-6 animate-fade-in">
            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
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
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
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
                <Button variant="link" className="text-xs text-primary p-0 h-auto hover:underline">
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
          </TabsContent>

          {/* Google Login */}
          <TabsContent value="google" className="space-y-6 animate-fade-in">
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-red-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Continue with Google</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Sign in securely with your Google account
              </p>
              <Button 
                onClick={handleGoogleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          </TabsContent>

          {/* OTP Login */}
          <TabsContent value="otp" className="space-y-6 animate-fade-in">
            {otpStep === 'email' ? (
              <form onSubmit={handleSubmitOTP(onOTPEmailSubmit)} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Login with OTP</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email to receive a 6-digit code
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="otp-email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="otp-email"
                      type="email"
                      placeholder="Enter your email"
                      {...registerOTP('email')}
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  {otpErrors.email && (
                    <p className="text-sm text-destructive mt-1">{otpErrors.email.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 transition-colors"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Send OTP
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Enter OTP</h3>
                  <p className="text-sm text-muted-foreground">
                    We sent a 6-digit code to {otpEmail}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Demo: Use 123456 to login
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium text-center block">
                    6-Digit Code
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpValue}
                      onChange={handleOTPComplete}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={resetOTPFlow}
                    variant="outline" 
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => onOTPEmailSubmit({ email: otpEmail })}
                    variant="outline" 
                    className="flex-1"
                  >
                    Resend OTP
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Fingerprint Login */}
          <TabsContent value="fingerprint" className="space-y-6 animate-fade-in">
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover-scale cursor-pointer" onClick={handleFingerprintLogin}>
                <Fingerprint className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Touch to Login</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Place your finger on the sensor to authenticate
              </p>
              <Button 
                onClick={handleFingerprintLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 transition-all hover-scale"
              >
                <Fingerprint className="w-4 h-4 mr-2" />
                Authenticate with Fingerprint
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Demo: 70% success rate simulation
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Button variant="link" className="text-xs text-primary p-0 h-auto hover:underline">
              Sign up here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;