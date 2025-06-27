import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Passkey {
  id: string;
  name: string;
  createdAt: string;
}

const SecuritySection: React.FC = () => {
  const { toast } = useToast();
  const [passkeys, setPasskeys] = useState<Passkey[]>([
    { id: '1', name: 'iPhone 15 Pro', createdAt: '2024-01-15' },
    { id: '2', name: 'MacBook Pro', createdAt: '2024-01-10' },
  ]);

  const handleRegisterPasskey = async () => {
    try {
      // Simulate WebAuthn registration
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newPasskey: Passkey = {
        id: Date.now().toString(),
        name: 'New Device',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setPasskeys(prev => [...prev, newPasskey]);

      toast({
        title: "Success",
        description: "Passkey registered successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register passkey. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePasskey = (id: string) => {
    setPasskeys(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Success",
      description: "Passkey removed successfully.",
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
        >
          Register New Passkey
        </Button>

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
