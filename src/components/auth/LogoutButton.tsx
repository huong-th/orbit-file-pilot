import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/hooks/redux';
import { logout } from '@/store/slices/authSlice.ts';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'ghost',
  size = 'sm',
  showIcon = true,
  showText = true,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());

    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account',
    });

    navigate('/login');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className="flex items-center gap-2 !h-auto"
    >
      {showIcon && <LogOut className="w-4 h-4" />}
      {showText && t('navigation.user.signOut')}
    </Button>
  );
};

export default LogoutButton;
