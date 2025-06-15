
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileManager } from '../../contexts/FileManagerContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Download, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';

const FilePreviewModal: React.FC = () => {
  const { modals, closeModal, previewFile, setRenameItem, setDeleteItems, openModal, displayedFiles, setPreviewFile } = useFileManager();
  const { t } = useTranslation();
  const [preloadedImages, setPreloadedImages] = useState<{ [key: string]: string }>({});

  // Get list of image files from current view
  const imageFiles = displayedFiles.filter(file => 
    file.type === 'file' && (file.icon === '🖼️' || file.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i))
  );

  // Find current image index
  const currentImageIndex = previewFile ? imageFiles.findIndex(file => file.id === previewFile.id) : -1;
  const totalImages = imageFiles.length;

  // Navigation functions
  const goToNextImage = useCallback(() => {
    if (currentImageIndex < totalImages - 1) {
      setPreviewFile(imageFiles[currentImageIndex + 1]);
    } else if (totalImages > 0) {
      // Wrap around to first image
      setPreviewFile(imageFiles[0]);
    }
  }, [currentImageIndex, totalImages, imageFiles, setPreviewFile]);

  const goToPreviousImage = useCallback(() => {
    if (currentImageIndex > 0) {
      setPreviewFile(imageFiles[currentImageIndex - 1]);
    } else if (totalImages > 0) {
      // Wrap around to last image
      setPreviewFile(imageFiles[totalImages - 1]);
    }
  }, [currentImageIndex, totalImages, imageFiles, setPreviewFile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!modals.preview) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextImage();
          break;
        case 'Escape':
          event.preventDefault();
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modals.preview, goToNextImage, goToPreviousImage]);

  // Preload adjacent images
  useEffect(() => {
    if (!previewFile || totalImages <= 1) return;

    const preloadImage = (file: any) => {
      if (preloadedImages[file.id]) return;

      const img = new Image();
      const imageUrl = `https://picsum.photos/800/600?random=${file.id}`;
      img.src = imageUrl;
      img.onload = () => {
        setPreloadedImages(prev => ({ ...prev, [file.id]: imageUrl }));
      };
    };

    // Preload next image
    const nextIndex = currentImageIndex < totalImages - 1 ? currentImageIndex + 1 : 0;
    if (imageFiles[nextIndex]) {
      preloadImage(imageFiles[nextIndex]);
    }

    // Preload previous image
    const prevIndex = currentImageIndex > 0 ? currentImageIndex - 1 : totalImages - 1;
    if (imageFiles[prevIndex]) {
      preloadImage(imageFiles[prevIndex]);
    }
  }, [currentImageIndex, totalImages, imageFiles, preloadedImages, previewFile]);

  const handleRename = () => {
    if (previewFile) {
      setRenameItem(previewFile);
      closeModal('preview');
      openModal('rename');
    }
  };

  const handleDelete = () => {
    if (previewFile) {
      setDeleteItems([previewFile]);
      closeModal('preview');
      openModal('delete');
    }
  };

  const handleClose = () => {
    closeModal('preview');
  };

  if (!previewFile) return null;

  const isImageFile = previewFile.type === 'file' && (previewFile.icon === '🖼️' || !!previewFile.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i));
  const isVideoFile = previewFile?.type === 'file' && 
    (previewFile.icon === '🎥' || !!previewFile.name.match(/\.(mp4|mov|avi|mkv|webm|m4v|3gp)$/i));

  // Show VideoPlayerModal for videos
  if (modals.preview && isVideoFile) {
    return <VideoPlayerModal />;
  }

  if (!modals.preview || !previewFile || !isImageFile) {
    return null;
  }

  const currentImageUrl = preloadedImages[previewFile.id] || previewFile.thumbnail || `https://picsum.photos/800/600?random=${previewFile.id}`;

  return (
    <Dialog open={modals.preview && isImageFile} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{previewFile.icon}</span>
              {previewFile.name}
              {isImageFile && totalImages > 1 && (
                <span className="text-sm text-muted-foreground ml-2">
                  {currentImageIndex + 1} {t('common.of')} {totalImages}
                </span>
              )}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Preview Area */}
          <div className="relative aspect-video bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl flex items-center justify-center border border-border/40 overflow-hidden">
            {isImageFile ? (
              <>
                <img 
                  src={currentImageUrl}
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain rounded-lg transition-all duration-300 ease-out"
                  loading="lazy"
                />
                
                {/* Navigation Arrows - Only show if there are multiple images */}
                {totalImages > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToPreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border/40 hover:bg-background/90 transition-all duration-200 hover:scale-105"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border/40 hover:bg-background/90 transition-all duration-200 hover:scale-105"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}

                {/* Image Counter Overlay */}
                {totalImages > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-border/40 rounded-full px-3 py-1 text-sm text-foreground">
                    {currentImageIndex + 1} / {totalImages}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">{previewFile.icon}</div>
                <p className="text-lg font-medium text-foreground">
                  {t('fileManager.filePreview')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('fileManager.previewNotAvailable')}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Hint */}
          {isImageFile && totalImages > 1 && (
            <div className="text-center text-xs text-muted-foreground">
              {t('fileManager.navigationHint')}
            </div>
          )}

          {/* File Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/30">
            <div>
              <h4 className="font-medium text-foreground mb-1">{t('fileManager.fileName')}</h4>
              <p className="text-sm text-muted-foreground">{previewFile.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">{t('fileManager.fileSize')}</h4>
              <p className="text-sm text-muted-foreground">{previewFile.size || t('common.unknown')}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">{t('fileManager.lastModified')}</h4>
              <p className="text-sm text-muted-foreground">{previewFile.lastModified}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">{t('fileManager.fileType')}</h4>
              <p className="text-sm text-muted-foreground capitalize">{previewFile.type}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button className="flex-1 bg-primary hover:bg-primary/90 transition-colors duration-200">
              <Download className="w-4 h-4 mr-2" />
              {t('actions.download')}
            </Button>
            <Button variant="outline" onClick={handleRename} className="hover:bg-accent/50 transition-colors duration-200">
              <Edit className="w-4 h-4 mr-2" />
              {t('actions.rename')}
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200">
              <Trash2 className="w-4 h-4 mr-2" />
              {t('actions.delete')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal;
