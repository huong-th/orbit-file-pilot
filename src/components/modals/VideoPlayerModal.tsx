import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileManager } from '../../contexts/FileManagerContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { X, Download, Edit, Trash2 } from 'lucide-react';

const VideoPlayerModal: React.FC = () => {
  const { modals, closeModal, previewFile, setRenameItem, setDeleteItems, openModal } = useFileManager();
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideoFile = previewFile?.type === 'file' && 
    (previewFile.icon === '🎥' || !!previewFile.name.match(/\.(mp4|mov|avi|mkv|webm|m4v|3gp)$/i));

  const shouldShowModal = modals.preview && isVideoFile;

  useEffect(() => {
    if (shouldShowModal && videoRef.current) {
      // Reset video when modal opens
      videoRef.current.currentTime = 0;
    }
  }, [shouldShowModal, previewFile?.id]);

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

  const handleDownload = () => {
    if (previewFile?.videoUrl) {
      const link = document.createElement('a');
      link.href = previewFile.videoUrl;
      link.download = previewFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!shouldShowModal || !previewFile) {
    return null;
  }

  return (
    <Dialog open={shouldShowModal} onOpenChange={() => closeModal('preview')}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black/95 border-border/20">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 p-6 pb-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-xl font-semibold text-white">
                  {previewFile.name}
                </DialogTitle>
                {previewFile.subtitle && (
                  <p className="text-sm text-gray-300">{previewFile.subtitle}</p>
                )}
                {previewFile.description && (
                  <p className="text-sm text-gray-400 max-w-2xl line-clamp-2">
                    {previewFile.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{previewFile.size}</span>
                  <span>{previewFile.lastModified}</span>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('actions.download')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRename}
                  className="text-white hover:bg-white/10"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('actions.rename')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('actions.delete')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => closeModal('preview')}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Video Player */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
              {previewFile.videoUrl ? (
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-auto max-h-[60vh] rounded-lg shadow-2xl"
                  poster={previewFile.thumbnail}
                  preload="metadata"
                >
                  <source src={previewFile.videoUrl} type="video/mp4" />
                  <p className="text-white">
                    Your browser does not support the video tag.
                  </p>
                </video>
              ) : (
                <div className="w-full h-[60vh] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">{previewFile.icon}</div>
                    <p className="text-lg mb-2">Video preview not available</p>
                    <p className="text-sm text-gray-400">File: {previewFile.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;