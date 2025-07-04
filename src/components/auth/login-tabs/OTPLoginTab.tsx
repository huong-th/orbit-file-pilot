import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const createOtpEmailSchema = (t: any) =>
  yup.object().shape({
    email: yup
      .string()
      .required(t('login.errors.emailRequired'))
      .email(t('login.errors.emailInvalid')),
  });

interface OTPEmailData {
  email: string;
}

interface OTPLoginTabProps {
  otpStep: 'email' | 'otp';
  otpValue: string;
  otpEmail: string;
  isLoading: boolean;
  onOTPEmailSubmit: (data: OTPEmailData) => Promise<void>;
  onOTPComplete: (value: string) => Promise<void>;
  onResetOTPFlow: () => void;
}

const OTPLoginTab: React.FC<OTPLoginTabProps> = ({
  otpStep,
  otpValue,
  otpEmail,
  isLoading,
  onOTPEmailSubmit,
  onOTPComplete,
  onResetOTPFlow,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPEmailData>({
    resolver: yupResolver(createOtpEmailSchema(t)),
    mode: 'onBlur',
  });

  if (otpStep === 'email') {
    return (
      <form onSubmit={handleSubmit(onOTPEmailSubmit)} className="space-y-6">
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
              {...register('email')}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </div>
          ) : (
            <>
              <Smartphone className="w-4 h-4 mr-2" />
              Send OTP
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Enter OTP</h3>
        <p className="text-sm text-muted-foreground">We sent a 6-digit code to {otpEmail}</p>
        <p className="text-xs text-muted-foreground mt-1">Demo: Use 123456 to login</p>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium text-center block">6-Digit Code</Label>
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otpValue} onChange={onOTPComplete}>
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
        <Button onClick={onResetOTPFlow} variant="outline" className="flex-1">
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
  );
};

export default OTPLoginTab;
