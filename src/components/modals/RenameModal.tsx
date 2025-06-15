
import React, { useState, useEffect } from 'react';
import { useFileManager } from '../../contexts/FileManagerContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Edit } from 'lucide-react';

const RenameModal: React.FC = () => {
  const { modals, closeModal, renameItem } = useFileManager();
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (renameItem) {
      setNewName(renameItem.name);
    }
  }, [renameItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && renameItem) {
      // Here you would typically rename the item
      console.log('Renaming item:', renameItem.id, 'to:', newName);
      handleClose();
    }
  };

  const handleClose = () => {
    setNewName('');
    closeModal('rename');
  };

  if (!renameItem) return null;

  return (
    <Dialog open={modals.rename} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Rename {renameItem.type === 'folder' ? 'Folder' : 'File'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-2xl">{renameItem.icon}</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{renameItem.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{renameItem.type}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-name">New Name</Label>
            <Input
              id="new-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newName.trim() || newName === renameItem.name}
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
