import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AvatarUpload from './AvatarUpload';
import PasswordSection from './PasswordSection';
import SecuritySection from './SecuritySection';
import DangerZone from './DangerZone';

interface FormData {
  username: string;
  email: string;
  avatar: File | null; // avatar có thể là File hoặc null
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: 'john_doe',
      email: 'john@example.com',
      avatar: null,
    } as FormData, // <--- Add this cast
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
              disabled={!isDirty || !isValid || isSubmitting}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
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
