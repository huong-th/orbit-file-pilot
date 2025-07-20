import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/store/slices/userProfileSlice';

import AvatarUpload from './AvatarUpload';
import DangerZone from './DangerZone';
import PasswordSection from './PasswordSection';
import SecuritySection from './SecuritySection';

interface FormData {
  username: string;
  email: string;
  avatar: File | null;
}

const schema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username must be at most 32 characters'),
  email: yup.string().required('Email is required').email('Please enter a valid email address'),
  avatar: yup.mixed<File>().nullable().optional(), // optional ở đây chỉ ra rằng nó có thể không có mặt, nhưng khi có thì nó là File hoặc null
});

const AccountSettingsForm: React.FC = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.userProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: user?.name || '',
      email: user?.email || '',
      avatar: null,
    } as FormData,
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        username: user.name || '',
        email: user.email || '',
        avatar: null,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const updateData: { username?: string; email?: string; avatar?: File } = {};
      
      if (data.username !== user?.name) updateData.username = data.username;
      if (data.email !== user?.email) updateData.email = data.email;
      if (data.avatar) updateData.avatar = data.avatar;

      await dispatch(updateUserProfile(updateData)).unwrap();

      toast({
        title: 'Success',
        description: 'Your account settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update account settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-border/40">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Desktop 2-column layout for ≥1280px, mobile stacked */}
            <div className="xl:grid xl:grid-cols-2 xl:gap-8 space-y-8 xl:space-y-0">
              {/* Left column: Avatar */}
              <div className="space-y-4">
                <Label className="text-base font-medium text-foreground">Profile Picture</Label>
                <AvatarUpload
                  onImageChange={(file) => setValue('avatar', file, { shouldDirty: true })}
                  currentImage={watch('avatar')}
                />
              </div>

              {/* Right column: Text fields */}
              <div className="space-y-6">
                {/* Username Field */}
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">
                    Username
                  </Label>
                  <Input
                    id="username"
                    {...register('username')}
                    className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={!isDirty || !isValid || isSubmitting || isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isLoading ? 'Loading...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <PasswordSection />

      {/* Security Section */}
      <SecuritySection />

      {/* Danger Zone */}
      <DangerZone />
    </div>
  );
};

export default AccountSettingsForm;
