import { X, CheckCircle, AlertCircle, Loader, Trash2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.ts';
import {
  closeUploadPopup,
  cancelUpload,
  removeUpload,
  clearCompletedUploads,
} from '@/store/slices/uploadSlice';
import { RootState } from '@/store/store';

const UploadProgressPopup: React.FC = () => {
  const dispatch = useAppDispatch();
  const { uploads, isPopupOpen, totalFiles, completedFiles } = useAppSelector(
    (state: RootState) => state.upload
  );

  if (!isPopupOpen || uploads.length === 0) return null;

  const handleClose = () => {
    dispatch(closeUploadPopup());
  };

  const handleCancelUpload = (fileId: string) => {
    dispatch(cancelUpload(fileId));
  };

  const handleRemoveUpload = (fileId: string) => {
    dispatch(removeUpload(fileId));
  };

  const handleClearCompleted = () => {
    dispatch(clearCompletedUploads());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96">
      <Card className="shadow-2xl border-2 border-border/50 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Uploading {uploads.length} file{uploads.length > 1 ? 's' : ''}
            </CardTitle>
            <div className="flex gap-2">
              {completedFiles > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCompleted}
                  className="text-xs"
                >
                  Clear completed
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleClose} className="p-1">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Overall progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {completedFiles} of {totalFiles} completed
              </span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 max-h-80 overflow-y-auto">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex-shrink-0">{getStatusIcon(upload.status)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{upload.file.name}</p>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatFileSize(upload.file.size)}
                  </span>
                </div>

                {upload.status === 'error' && upload.error && (
                  <p className="text-xs text-red-500 mb-1">{upload.error}</p>
                )}

                {(upload.status === 'uploading' || upload.status === 'pending') && (
                  <div className="space-y-1">
                    <Progress value={upload.progress} className="h-1" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{upload.progress}%</span>
                      <span>{upload.status}</span>
                    </div>
                  </div>
                )}

                {upload.status === 'completed' && (
                  <p className="text-xs text-green-600">Upload complete</p>
                )}

                {upload.status === 'cancelled' && (
                  <p className="text-xs text-orange-600">Upload cancelled</p>
                )}
              </div>

              <div className="flex gap-1">
                {(upload.status === 'uploading' || upload.status === 'pending') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelUpload(upload.id)}
                    className="p-1 h-6 w-6"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}

                {(upload.status === 'completed' ||
                  upload.status === 'error' ||
                  upload.status === 'cancelled') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUpload(upload.id)}
                    className="p-1 h-6 w-6"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadProgressPopup;
