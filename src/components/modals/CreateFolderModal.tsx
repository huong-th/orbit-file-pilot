import { FolderPlus, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.ts';
import { createFolder } from '@/store/slices/fileSystemThunks';
import { closeModal } from '@/store/slices/uiSlice';

import type { RootState } from '@/store/store.ts';

const CreateFolderModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s: RootState) => s.ui.modals.createFolder);
  const currentFolderId = useAppSelector((s: RootState) => s.navigation.currentFolderId);

  const [folderName, setFolderName] = useState('');
  const [autoRename, setAutoRename] = useState(true); // ✅ mặc định bật
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetAndClose = () => {
    setFolderName('');
    setAutoRename(true);
    setIsCreating(false);
    setErrorMessage('');
    dispatch(closeModal('createFolder'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || isCreating) return;

    setIsCreating(true);
    setErrorMessage('');

    try {
      await dispatch(
        createFolder({
          name: folderName,
          parentId: currentFolderId === 'root' ? null : currentFolderId,
          autoRename: autoRename, // 👈 Gửi lên backend
        })
      ).unwrap();

      resetAndClose();
    } catch (error) {
      console.error('Failed to create folder:', error);
      if (typeof error === 'string') {
        setErrorMessage(error);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-600" />
            Create New Folder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              type="text"
              placeholder="Enter folder name..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full"
              autoFocus
              disabled={isCreating}
            />

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="auto-rename"
              checked={autoRename}
              onCheckedChange={(v) => setAutoRename(!!v)}
              disabled={isCreating}
            />
            <Label htmlFor="auto-rename" className="cursor-pointer">
              Auto Rename if Duplicate
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!folderName.trim() || isCreating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Folder'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
