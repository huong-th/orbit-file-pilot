import { Download, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { buildPaginationKey } from '@/lib/utils';
import { closeModal, openModal } from '@/store/slices/uiSlice'; // ▶︎ contains modals.preview state
import { setPreviewFile, setRenameItem, setDeleteItems } from '@/store/slices/uiSlice'; // ▶︎ holds previewFile & helpers

import VideoPlayerModal from './VideoPlayerModal';

/* ────────────────────────── helper preview comps ─────────────────────────── */
const OfficePreview = ({ fileUrl }: { fileUrl: string }) => {
  const viewer = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
  return (
    <iframe
      src={viewer}
      width="100%"
      height="600"
      title="Office Preview"
      className="rounded-lg border border-border/30"
    />
  );
};

const PDFPreview = ({ fileUrl }: { fileUrl: string }) => (
  <iframe
    src={fileUrl}
    width="100%"
    height="600"
    title="PDF Preview"
    className="rounded-lg border border-border/30"
  />
);

/* ───────────────────────────────── component ─────────────────────────────── */
const FilePreviewModal: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  /* ---------- Redux state ---------- */
  const modals = useAppSelector((s) => s.ui.modals);
  const previewFile = useAppSelector((s) => s.ui.previewFile);
  const currentFilter = useAppSelector((s) => s.view.currentFilter);
  const folderId = useAppSelector((s) => s.navigation.currentFolderId);

  /** build displayed files list (same as MainContent) */
  const key = buildPaginationKey(folderId, currentFilter);
  const fileIds = useAppSelector((s) => s.fileSystem.filesByFolder[key] ?? []);
  const displayedFiles = useAppSelector((s) =>
    fileIds.map((id) => s.fileSystem.fileById[id]).filter(Boolean)
  );

  /* ---------- local state for image pre-load ---------- */
  const [cache, setCache] = useState<Record<string, string>>({});

  /* ---------- list of images in view ---------- */
  const imageFiles = displayedFiles.filter(
    (f) =>
      f.kind === 'file' &&
      (f.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) || f.mime_type?.startsWith('image'))
  );

  const currentIndex = previewFile ? imageFiles.findIndex((f) => f.id === previewFile.id) : -1;
  const totalImages = imageFiles.length;

  /* ---------- navigation helpers ---------- */
  const showNext = useCallback(() => {
    if (!totalImages) return;
    const next = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
    dispatch(setPreviewFile(imageFiles[next]));
  }, [dispatch, currentIndex, totalImages, imageFiles]);

  const showPrev = useCallback(() => {
    if (!totalImages) return;
    const prev = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
    dispatch(setPreviewFile(imageFiles[prev]));
  }, [dispatch, currentIndex, totalImages, imageFiles]);

  /* ---------- keyboard nav ---------- */
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (!modals.preview) return;
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'Escape') dispatch(closeModal('preview'));
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [modals.preview, showNext, showPrev, dispatch]);

  /* ---------- preload neighbour images ---------- */
  useEffect(() => {
    if (!previewFile || totalImages <= 1) return;

    const preload = (fileId: string) => {
      if (cache[fileId]) return;
      const url = `https://picsum.photos/800/600?random=${fileId}`;
      const img = new Image();
      img.src = url;
      img.onload = () => setCache((c) => ({ ...c, [fileId]: url }));
    };

    const nextIdx = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
    preload(imageFiles[nextIdx]?.id);
    preload(imageFiles[prevIdx]?.id);
  }, [previewFile, currentIndex, totalImages, imageFiles, cache]);

  /* ---------- action handlers ---------- */
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

  const handleClose = () => dispatch(closeModal('preview'));

  /* ---------- type guards ---------- */
  if (!previewFile) return null;

  const isImage = previewFile.kind === 'file' && imageFiles.length;
  const isVideo = previewFile.kind === 'file' && previewFile.mime_type?.startsWith('video');

  const isPDF = previewFile.kind === 'file' && previewFile.mime_type === 'application/pdf';
  const isOffice =
    previewFile.kind === 'file' && !!previewFile.name.match(/\.(docx?|pptx?|xlsx?)$/i);

  /* ---- delegate to video modal ---- */
  if (modals.preview && isVideo) return <VideoPlayerModal />;

  /* ---- main render ---- */
  const imgUrl =
    cache[previewFile.id] ||
    previewFile.thumbnailUrl ||
    `https://picsum.photos/800/600?random=${previewFile.id}`;

  return (
    <Dialog open={modals.preview} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{previewFile.name}</span>
              {isImage && totalImages > 1 && (
                <span className="text-sm text-muted-foreground ml-2">
                  {currentIndex + 1} {t('common.of')} {totalImages}
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

        {/* PREVIEW AREA */}
        <div className="space-y-6">
          <div className="relative bg-muted/20 rounded-xl border border-border/40 flex justify-center">
            {isImage ? (
              <>
                <img
                  src={imgUrl}
                  alt={previewFile.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
                {totalImages > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={showPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={showNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </>
            ) : isPDF ? (
              <PDFPreview fileUrl={previewFile.object_key} />
            ) : isOffice ? (
              <OfficePreview fileUrl={previewFile.object_key} />
            ) : (
              <p className="p-6">{t('fileManager.previewNotAvailable')}</p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-primary">
              <Download className="w-4 h-4 mr-2" />
              {t('actions.download')}
            </Button>
            <Button variant="outline" onClick={handleRename}>
              <Edit className="w-4 h-4 mr-2" />
              {t('actions.rename')}
            </Button>
            <Button variant="outline" className="text-destructive" onClick={handleDelete}>
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
