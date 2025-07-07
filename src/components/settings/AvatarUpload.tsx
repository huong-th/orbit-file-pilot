import { Upload, User } from 'lucide-react';
import React, { useRef, useState, useCallback } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  onImageChange: (file: File | null) => void;
  currentImage?: File | null;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ onImageChange, currentImage }) => {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/png', 'image/jpeg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PNG or JPEG image.',
        variant: 'destructive',
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleFileChange = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageChange(file);
    },
    [onImageChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileChange(files[0]);
      }
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  return (
    <div className="xl:flex xl:flex-col xl:items-center xl:space-y-4 flex items-center space-x-4 xl:space-x-0">
      <Avatar className="w-32 h-32 border-2 border-border">
        <AvatarImage src={previewUrl || undefined} />
        <AvatarFallback className="bg-muted border-border">
          <User className="w-12 h-12 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 xl:w-full">
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors min-h-[44px] flex flex-col justify-center ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 bg-card'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-foreground">Drag & drop or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PNG or JPEG, max 2MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AvatarUpload;
