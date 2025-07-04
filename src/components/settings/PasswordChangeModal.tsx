import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import zxcvbn from 'zxcvbn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const passwordSchema = yup.object({
  currentPassword: yup.string().when('newPassword', {
    is: (val: string) => !!val,
    then: (schema) => schema.required('Current password is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  newPassword: yup
    .string()
    .notRequired()
    .min(12, 'Password must be at least 12 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one digit')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one symbol'),

  confirmPassword: yup.string().when('newPassword', {
    is: (val: string) => !!val,
    then: (schema) =>
      schema
        .required('Please confirm your password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const passwordStrength = newPassword ? zxcvbn(newPassword) : null;

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-muted';
    }
  };

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Medium';
      case 3:
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const onSubmit = async (data: PasswordFormData) => {
    // Skip if all fields are empty
    if (!data.currentPassword && !data.newPassword && !data.confirmPassword) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Success',
        description: 'Your password has been updated successfully.',
      });

      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md glass-card border-border/40 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Change Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-foreground">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
              placeholder="Enter current password"
              className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-foreground">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              placeholder="Enter new password"
              className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}

            {passwordStrength && newPassword && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${((passwordStrength.score + 1) / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {getStrengthText(passwordStrength.score)}
                  </span>
                </div>
                {passwordStrength.feedback.warning && (
                  <p className="text-xs text-amber-400">{passwordStrength.feedback.warning}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Confirm new password"
              className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <DialogFooter className="space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-11 bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordChangeModal;
