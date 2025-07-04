import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PasswordChangeModal from './PasswordChangeModal';

const PasswordSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="glass-card border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Password & Security
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-11 w-11 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg"
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <PasswordChangeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default PasswordSection;
