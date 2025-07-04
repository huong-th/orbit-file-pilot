import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DangerZone: React.FC = () => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
        variant: 'destructive',
      });

      // In a real app, you would redirect to login or home page
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="glass-card border-2 border-red-500/30 bg-red-900/10">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-red-400 flex items-center space-x-2">
          <Trash2 className="w-5 h-5" />
          <span>Danger Zone</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-red-300">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              >
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-card border-border/40 text-foreground">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This action cannot be undone. This will permanently delete your account and remove
                  all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default DangerZone;
