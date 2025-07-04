import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FolderPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RootState, AppDispatch } from '@/store/store.ts';
import { closeModal } from '@/store/slices/uiSlice';
// TODO: import createFolder thunk when backend is ready
import { createFolder } from '@/store/slices/fileSystemThunks';

const CreateFolderModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((s: RootState) => s.ui.modals.createFolder);
  const [folderName, setFolderName] = useState('');

  const resetAndClose = () => {
    setFolderName('');
    dispatch(closeModal('createFolder'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    // TODO: dispatch(createFolder({ name: folderName, parentId: currentFolderId }))
    dispatch(createFolder({ name: folderName, parentId: 'currentFolderId' }));
    resetAndClose();
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
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!folderName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
