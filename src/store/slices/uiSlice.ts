import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RemoteFile, DriveItem } from '@/types/files';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
export type ModalKey = 'upload' | 'createFolder' | 'preview' | 'rename' | 'delete';

export interface UiState {
  modals: Record<ModalKey, boolean>;
  previewFile: RemoteFile | null;
  renameItem: DriveItem | null;
  deleteItems: DriveItem[];
}

const initialState: UiState = {
  modals: {
    upload: false,
    createFolder: false,
    preview: false,
    rename: false,
    delete: false,
  },
  previewFile: null,
  renameItem: null,
  deleteItems: [],
};

/* ------------------------------------------------------------------ */
/*  Slice                                                             */
/* ------------------------------------------------------------------ */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // ------- modal helpers ----------------------------------------
    openModal(state, { payload }: PayloadAction<ModalKey>) {
      state.modals[payload] = true;
    },
    closeModal(state, { payload }: PayloadAction<ModalKey>) {
      state.modals[payload] = false;
    },

    // ------- preview / rename / delete selections -----------------
    setPreviewFile(state, action: PayloadAction<RemoteFile | null>) {
      state.previewFile = action.payload;
    },
    setRenameItem(state, action: PayloadAction<DriveItem | null>) {
      state.renameItem = action.payload;
    },
    setDeleteItems(state, action: PayloadAction<DriveItem[]>) {
      state.deleteItems = action.payload;
    },

    // ------- reset (logout etc.) ----------------------------------
    clearUi: () => initialState,
  },
});

export const { openModal, closeModal, setPreviewFile, setRenameItem, setDeleteItems, clearUi } =
  uiSlice.actions;

export default uiSlice.reducer;
