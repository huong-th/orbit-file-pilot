import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RemoteFile, RemoteFolder } from '@/types/files';

/**
 * State structure (normalized)
 * ────────────────────────────────────────────────────────────────
 * filesByFolder[parentKey]    → ordered array of file IDs
 * foldersByFolder[parentKey]  → ordered array of folder IDs
 * fileById / folderById       → metadata lookup
 */
export interface FileSystemState {
  filesByFolder: Record<string, string[]>;
  foldersByFolder: Record<string, string[]>;
  fileById: Record<string, RemoteFile>;
  folderById: Record<string, RemoteFolder>;
}

const initialState: FileSystemState = {
  filesByFolder: {},
  foldersByFolder: {},
  fileById: {},
  folderById: {},
};

/* Merge helper – giữ thứ tự cũ + bỏ trùng */
const mergeUnique = (prev: string[] = [], incoming: string[]) => {
  const set = new Set(prev);
  incoming.forEach((id) => set.add(id));
  return Array.from(set);
};

const fsSlice = createSlice({
  name: 'fileSystem',
  initialState,
  reducers: {
    /* --------------------------------------------------------- */
    /* Bulk upsert (list API)                                    */
    /* --------------------------------------------------------- */
    upsertFiles(state, { payload }: PayloadAction<{ parentKey: string; file?: RemoteFile, files?: RemoteFile[] }>) {
      const { parentKey, file, files } = payload;
      if (file) {
        // If a single file is provided, convert it to an array
        state.fileById[file.id] = file;
        state.filesByFolder[parentKey] = mergeUnique(state.filesByFolder[parentKey], [file.id]);
      } else if (files) {
        files.forEach((f) => {
          state.fileById[f.id] = f;
        });
        const ids = files.map((f) => f.id);
        state.filesByFolder[parentKey] = mergeUnique(state.filesByFolder[parentKey], ids);
      }
    },

    upsertFolders(
      state,
      { payload }: PayloadAction<{ parentKey: string; folders: RemoteFolder[] }>
    ) {
      const { parentKey, folders } = payload;
      folders.forEach((f) => {
        state.folderById[f.id] = f;
      });
      const ids = folders.map((f) => f.id);
      state.foldersByFolder[parentKey] = mergeUnique(state.foldersByFolder[parentKey], ids);
    },

    /* --------------------------------------------------------- */
    /* Single-entity upsert (metadata API)                       */
    /* --------------------------------------------------------- */
    upsertFile(state, { payload }: PayloadAction<RemoteFile>) {
      state.fileById[payload.id] = payload;
    },
    upsertFolder(state, { payload }: PayloadAction<RemoteFolder>) {
      state.folderById[payload.id] = payload;
    },

    /* --------------------------------------------------------- */
    /* Removals (soft delete from cache)                         */
    /* --------------------------------------------------------- */
    removeFile(state, { payload }: PayloadAction<{ parentKey: string; fileId: string }>) {
      const { parentKey, fileId } = payload;
      delete state.fileById[fileId];
      state.filesByFolder[parentKey] = (state.filesByFolder[parentKey] ?? []).filter(
        (id) => id !== fileId
      );
    },

    removeFolder(state, { payload }: PayloadAction<{ parentKey: string; folderId: string }>) {
      const { parentKey, folderId } = payload;
      delete state.folderById[folderId];
      state.foldersByFolder[parentKey] = (state.foldersByFolder[parentKey] ?? []).filter(
        (id) => id !== folderId
      );
    },

    /* --------------------------------------------------------- */
    /* Clear on logout                                           */
    /* --------------------------------------------------------- */
    clearFileSystem: () => initialState,
  },
});

export const {
  upsertFiles,
  upsertFolders,
  upsertFile,
  upsertFolder,
  removeFile,
  removeFolder,
  clearFileSystem,
} = fsSlice.actions;

export default fsSlice.reducer;
