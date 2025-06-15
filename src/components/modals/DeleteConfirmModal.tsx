
import React from 'react';
import { useFileManager } from '../../contexts/FileManagerContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmModal: React.FC = () => {
  const { modals, closeModal, deleteItems } = useFileManager();

  const handleDelete = () => {
    // Here you would typically delete the items
    console.log('Deleting items:', deleteItems);
    closeModal('delete');
  };

  const handleClose = () => {
    closeModal('delete');
  };

  if (deleteItems.length === 0) return null;

  const isMultiple = deleteItems.length > 1;
  const itemName = isMultiple ? `${deleteItems.length} items` : deleteItems[0].name;

  return (
    <Dialog open={modals.delete} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete {isMultiple ? 'Items' : deleteItems[0].type === 'folder' ? 'Folder' : 'File'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete{' '}
            <span className="font-medium">{itemName}</span>?
          </p>

          {!isMultiple && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-2xl">{deleteItems[0].icon}</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{deleteItems[0].name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {deleteItems[0].type} • {deleteItems[0].size || 'Unknown size'}
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Warning:</strong> This action cannot be undone. {isMultiple ? 'These items' : 'This item'} will be permanently deleted.
            </p>
          </div>
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
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete {isMultiple ? 'Items' : 'Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;
