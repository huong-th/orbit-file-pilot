
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Upload, FolderPlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useFileManager } from '../contexts/FileManagerContext';

const FloatingActionButton: React.FC = () => {
  const { openModal } = useFileManager();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleUploadFile = () => {
    openModal('upload');
    setIsMenuOpen(false);
  };

  const handleCreateFolder = () => {
    openModal('createFolder');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Action Menu */}
        <div
          ref={menuRef}
          className={`absolute bottom-16 right-0 transition-all duration-300 ease-out ${
            isMenuOpen 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-3 p-3 glass-card rounded-xl border border-border/40 shadow-xl min-w-[200px]">
            {/* Upload File Action */}
            <Button
              onClick={handleUploadFile}
              variant="ghost"
              className="justify-start gap-3 h-12 px-4 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <span className="font-medium">Upload File</span>
            </Button>

            {/* Create Folder Action */}
            <Button
              onClick={handleCreateFolder}
              variant="ghost"
              className="justify-start gap-3 h-12 px-4 hover:bg-secondary/10 hover:text-secondary-foreground transition-all duration-200 rounded-lg group"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                <FolderPlus className="w-4 h-4" />
              </div>
              <span className="font-medium">New Folder</span>
            </Button>
          </div>
        </div>

        {/* Main FAB */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={buttonRef}
              onClick={toggleMenu}
              size="lg"
              className={`h-14 w-14 rounded-2xl gradient-primary hover:scale-110 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 hover-glow ${
                isMenuOpen ? 'rotate-45' : 'rotate-0'
              }`}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-3 glass-card border border-border/40 shadow-lg rounded-lg">
            <p className="font-medium">{isMenuOpen ? 'Close Menu' : 'Quick Actions'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default FloatingActionButton;
