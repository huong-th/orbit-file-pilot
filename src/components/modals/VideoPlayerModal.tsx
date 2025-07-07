import { X, Download, Edit, Trash2 } from 'lucide-react';
import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { closeModal, openModal } from '@/store/slices/uiSlice'; // manages `modals.preview`
import { setRenameItem, setDeleteItems } from '@/store/slices/uiSlice'; // holds preview helpers

const VideoPlayerModal: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  /* ---------- Redux state ---------- */
  const modals = useAppSelector((s) => s.ui.modals);
  const previewFile = useAppSelector((s) => s.ui.previewFile);

  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideoFile =
    previewFile?.kind === 'file' &&
    (previewFile.mime_type?.startsWith('video') ||
      !!previewFile.name.match(/\.(mp4|mov|avi|mkv|webm|m4v|3gp)$/i));

  const shouldShow = modals.preview && isVideoFile;

  /* ---------- reset currentTime on open ---------- */
  useEffect(() => {
    if (shouldShow && videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [shouldShow, previewFile?.id]);

  /* ---------- actions ---------- */
  const handleRename = () => {
    if (!previewFile) return;
    dispatch(setRenameItem(previewFile));
    dispatch(closeModal('preview'));
    dispatch(openModal('rename'));
  };

  const handleDelete = () => {
    if (!previewFile) return;
    dispatch(setDeleteItems([previewFile]));
    dispatch(closeModal('preview'));
    dispatch(openModal('delete'));
  };

  const handleDownload = () => {
    if (previewFile?.object_key) {
      const a = document.createElement('a');
      a.href = previewFile.object_key; // presigned URL in real app
      a.download = previewFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (!shouldShow || !previewFile) return null;

  return (
    <Dialog open={shouldShow} onOpenChange={() => dispatch(closeModal('preview'))}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black/95 border-border/20">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 p-6 pb-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-xl font-semibold text-white">
                  {previewFile.name}
                </DialogTitle>
                {/*{previewFile.subtitle && (*/}
                {/*  <p className="text-sm text-gray-300">{previewFile.subtitle}</p>*/}
                {/*)}*/}
                {/*{previewFile.description && (*/}
                {/*  <p className="text-sm text-gray-400 max-w-2xl line-clamp-2">*/}
                {/*    {previewFile.description}*/}
                {/*  </p>*/}
                {/*)}*/}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{previewFile.size}</span>
                  <span>{previewFile.updatedAt}</span>
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
                  onClick={() => dispatch(closeModal('preview'))}
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
              {previewFile.object_key ? (
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-auto max-h-[60vh] rounded-lg shadow-2xl"
                  poster={previewFile.thumbnailUrl}
                  preload="metadata"
                >
                  <source src={previewFile.object_key} type={previewFile.mime_type} />
                  <p className="text-white">{t('fileManager.previewNotAvailable')}</p>
                </video>
              ) : (
                <div className="w-full h-[60vh] bg-gray-800 rounded-lg flex items-center justify-center text-white">
                  {t('fileManager.previewNotAvailable')}
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
