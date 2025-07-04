// src/components/modals/RenameModal.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { RootState, AppDispatch } from '@/store/store.ts';
import { closeModal, setRenameItem } from '@/store/slices/uiSlice';
// TODO: import renameFileOrFolder thunk once backend endpoint exists

const RenameModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((s: RootState) => s.ui.modals.rename);
  const item = useSelector((s: RootState) => s.ui.renameItem);
  const [newName, setNewName] = useState('');

  // Populate input when item changes
  useEffect(() => {
    if (item) setNewName(item.name);
  }, [item]);

  const resetAndClose = () => {
    setNewName('');
    dispatch(closeModal('rename'));
    dispatch(setRenameItem(null));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !newName.trim() || newName === item.name) return;

    // TODO: dispatch(renameFileOrFolder({ id: item.id, name: newName }))
    console.log('Renaming', item.id, 'to', newName);
    resetAndClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Rename {item.kind === 'folder' ? 'Folder' : 'File'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-name">New Name</Label>
            <Input
              id="new-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newName.trim() || newName === item.name}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameModal;
