import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { RootState, AppDispatch } from '@/store/store.ts';
import { closeModal, setDeleteItems } from '@/store/slices/uiSlice';
// TODO: import deleteFiles thunk when endpoint ready

const DeleteConfirmModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((s: RootState) => s.ui.modals.delete);
  const deleteItems = useSelector((s: RootState) => s.ui.deleteItems);

  const resetAndClose = () => {
    dispatch(closeModal('delete'));
    dispatch(setDeleteItems([]));
  };

  const handleDelete = () => {
    // TODO: dispatch(deleteFiles(deleteItems.map((f) => f.id)))
    console.log(
      'Deleting items:',
      deleteItems.map((f) => f.id)
    );
    resetAndClose();
  };

  if (deleteItems.length === 0) return null;

  const isMultiple = deleteItems.length > 1;
  const itemName = isMultiple ? `${deleteItems.length} items` : deleteItems[0].name;
  const itemTypeLabel = deleteItems[0].kind === 'folder' ? 'Folder' : 'File';

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete {isMultiple ? 'Items' : itemTypeLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <span className="font-medium">{itemName}</span>?
          </p>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Warning:</strong> This action cannot be undone.{' '}
              {isMultiple ? 'These items' : 'This item'} will be permanently deleted.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
            Delete {isMultiple ? 'Items' : 'Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;
