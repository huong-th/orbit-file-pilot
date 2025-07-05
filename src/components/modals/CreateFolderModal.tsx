
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FolderPlus, Loader2 } from 'lucide-react';
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
import { createFolder } from '@/store/slices/fileSystemThunks';

const CreateFolderModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((s: RootState) => s.ui.modals.createFolder);
  const currentFolderId = useSelector((s: RootState) => s.navigation.currentFolderId);
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const resetAndClose = () => {
    setFolderName('');
    setIsCreating(false);
    dispatch(closeModal('createFolder'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || isCreating) return;

    setIsCreating(true);
    
    try {
      await dispatch(createFolder({ 
        name: folderName, 
        parentId: currentFolderId === 'root' ? null : currentFolderId 
      })).unwrap();
      
      resetAndClose();
    } catch (error) {
      console.error('Failed to create folder:', error);
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
