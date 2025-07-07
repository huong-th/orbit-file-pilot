import { Edit } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
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
import { closeModal, setRenameItem } from '@/store/slices/uiSlice';

import type { RootState } from '@/store/store.ts';
// TODO: import renameFileOrFolder thunk once backend endpoint exists

const RenameModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s: RootState) => s.ui.modals.rename);
  const item = useAppSelector((s: RootState) => s.ui.renameItem);
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
