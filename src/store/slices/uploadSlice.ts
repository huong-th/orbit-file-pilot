import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {nanoid} from "nanoid";

import {ROOT_ID} from "@/constants";
import { buildPaginationKey } from '@/lib/utils';
import api from '@/services/api';
import { upsertFiles } from '@/store/slices/fileSystemSlice';
import {RootState} from "@/store/store.ts";

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
}

export interface UploadState {
  uploads: UploadFile[];
  isPopupOpen: boolean;
  totalFiles: number;
  completedFiles: number;
}

const initialState: UploadState = {
  uploads: [],
  isPopupOpen: false,
  totalFiles: 0,
  completedFiles: 0,
};

// export const uploadFiles = createAsyncThunk<
//   void,
//   { files: File[]; currentFolderId?: string | null },
//   { state: RootState; dispatch: any }
// >('upload/uploadFiles', async ({ files, currentFolderId }, { dispatch, getState }) => {
//   for (const file of files) {
//     const uploadId = nanoid();
//     dispatch(startUpload({ fileId: uploadId, file }));
//
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('parent_id', currentFolderId ?? '');
//
//     try {
//       await api.post('/files/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (e) => {
//           const percent = Math.round((e.loaded * 100) / e.total);
//           dispatch(updateUploadProgress({ fileId: uploadId, progress: percent }));
//         },
//       });
//
//       dispatch(completeUpload({ fileId: uploadId }));
//     } catch (err: any) {
//       dispatch(failUpload({ fileId: uploadId, error: err.message }));
//     }
//   }
// });

// Async thunk for uploading files
export const uploadFiles = createAsyncThunk<
  void, // Return type
  { currentFolderId: string }, // Arg type
  { state: RootState } // ThunkAPI config
>(
  'upload/uploadFiles',
  async (
    { currentFolderId }: { currentFolderId: string },
    { dispatch, getState }
  ) => {
    const filesToUpload = getState().upload.uploads.filter((u) => u.status === 'pending');

    for (const upload of filesToUpload) {
      const { id: uploadId, file } = upload;

      dispatch(startUpload({ fileId: uploadId }));

      const formData = new FormData();
      formData.append('file', file);
      if (currentFolderId !== ROOT_ID) formData.append('parent_id', currentFolderId ?? null);

      try {
        const response = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            dispatch(updateUploadProgress({ fileId: uploadId, progress: percent }));
          },
        });

        dispatch(completeUpload({ fileId: uploadId }));
        const parentKey = buildPaginationKey(currentFolderId, 'all');
        dispatch(upsertFiles({ parentKey, file: response.data.files || response.data }));
      } catch (err: any) {
        dispatch(failUpload({ fileId: uploadId, error: err.message }));
      }
    }
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addFilesToUpload: (state, action: PayloadAction<File[]>) => {
      const newUploads = action.payload.map((file) => ({
        id: nanoid(),
        file,
        progress: 0,
        status: 'pending' as const,
      }));

      state.uploads.push(...newUploads);
      state.totalFiles += newUploads.length;
      state.isPopupOpen = true;
    },

    startUpload: (state, action: PayloadAction<{ fileId: string }>) => {
      const upload = state.uploads.find((u) => u.id === action.payload.fileId);
      if (upload) {
        upload.status = 'uploading';
      }
    },

    updateUploadProgress: (state, action: PayloadAction<{ progress: number; fileId?: string }>) => {
      const { progress, fileId } = action.payload;

      if (fileId) {
        const upload = state.uploads.find((u) => u.id === fileId);
        if (upload) {
          upload.progress = progress;
          if (progress === 100) {
            upload.status = 'completed';
            state.completedFiles++;
          } else {
            upload.status = 'uploading';
          }
        }
      } else {
        // Update all pending/uploading files
        state.uploads.forEach((upload) => {
          if (upload.status === 'pending' || upload.status === 'uploading') {
            upload.progress = progress;
            if (progress === 100) {
              upload.status = 'completed';
            } else {
              upload.status = 'uploading';
            }
          }
        });
      }
    },

    completeUpload: (state, action: PayloadAction<{ fileId: string }>) => {
      const upload = state.uploads.find((u) => u.id === action.payload.fileId);
      if (upload) {
        upload.status = 'completed';
        upload.progress = 100;
      }
    },

    failUpload: (state, action: PayloadAction<{ fileId: string; error: string }>) => {
      const upload = state.uploads.find((u) => u.id === action.payload.fileId);
      if (upload) {
        upload.status = 'error';
        upload.error = action.payload.error;
      }
    },

    cancelUpload: (state, action: PayloadAction<string>) => {
      const upload = state.uploads.find((u) => u.id === action.payload);
      if (upload) {
        upload.status = 'cancelled';
      }
    },

    removeUpload: (state, action: PayloadAction<string>) => {
      state.uploads = state.uploads.filter((u) => u.id !== action.payload);
    },

    openUploadPopup: (state) => {
      state.isPopupOpen = true;
    },

    closeUploadPopup: (state) => {
      state.isPopupOpen = false;
    },

    clearCompletedUploads: (state) => {
      state.uploads = state.uploads.filter((u) => u.status !== 'completed');
      state.completedFiles = 0;
      state.totalFiles = state.uploads.length;
    },

    resetUploads: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(uploadFiles.pending, (state) => {
        // state.uploads.forEach((upload) => {
        //   if (upload.status === 'pending') {
        //     upload.status = 'uploading';
        //   }
        // });
      })
      .addCase(uploadFiles.fulfilled, (state) => {
        state.uploads.forEach((upload) => {
          if (upload.status === 'uploading') {
            upload.status = 'completed';
            upload.progress = 100;
          }
        });
        state.completedFiles = state.totalFiles;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.uploads.forEach((upload) => {
          if (upload.status === 'uploading') {
            upload.status = 'error';
            upload.error = action.payload as string;
          }
        });
      });
  },
});

export const {
  addFilesToUpload,
  updateUploadProgress,
  cancelUpload,
  removeUpload,
  openUploadPopup,
  closeUploadPopup,
  clearCompletedUploads,
  resetUploads,
  startUpload,
  completeUpload,
  failUpload,
} = uploadSlice.actions;

export default uploadSlice.reducer;
