import React from 'react';
import { Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/hooks/redux'; // Import hooks Redux
import { registerNewPasskey } from '@/store/slices/authSlice'; // Import thunk mới
import { removePasskey } from '@/store/slices/passkeySlice'; // Import action và kiểu từ passkeySlice

const SecuritySection: React.FC = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const passkeys = useAppSelector((state) => state.passkey.passkeys);
  const { isLoading, error } = useAppSelector((state) => state.auth); // Lấy trạng thái loading/error từ auth slice

  const handleRegisterPasskey = async () => {
    const userEmail = 'john.doe@example.com'; // Thay thế bằng email người dùng thực tế

    if (!userEmail) {
      toast({
        title: 'Error',
        description: 'User email not found. Please log in first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Dispatch thunk để đăng ký passkey
      const resultAction = await dispatch(registerNewPasskey({ email: userEmail }));

      if (registerNewPasskey.fulfilled.match(resultAction)) {
        toast({
          title: 'Success',
          description: 'Passkey registered successfully.',
        });
      } else if (registerNewPasskey.rejected.match(resultAction)) {
        toast({
          title: 'Error',
          description: resultAction.payload as string,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to register passkey. An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleRemovePasskey = (id: string) => {
    // Dispatch action để xóa passkey khỏi Redux store
    dispatch(removePasskey(id));
    toast({
      title: 'Success',
      description: 'Passkey removed successfully.',
    });
  };

  return (
    <Card className="glass-card border-border/40">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Security Keys</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use passkeys for secure, passwordless authentication.
        </p>
        <Button
          onClick={handleRegisterPasskey}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register New Passkey'}
        </Button>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}{' '}
        {/* Hiển thị lỗi nếu có */}
        {passkeys.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Registered Passkeys</h4>
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{passkey.name}</p>
                  <p className="text-xs text-muted-foreground">Added {passkey.createdAt}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePasskey(passkey.id)}
                  className="h-11 w-11 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecuritySection;
