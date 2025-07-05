
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { upsertFiles } from '@/store/slices/fileSystemSlice';
import { buildPaginationKey } from '@/lib/utils';

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

// Async thunk for uploading files
export const uploadFiles = createAsyncThunk(
  'upload/uploadFiles',
  async (
    { files, currentFolderId }: { files: File[]; currentFolderId: string },
    { dispatch, rejectWithValue, getState }
  ) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // Add current folder ID if not root
      if (currentFolderId && currentFolderId !== 'root') {
        formData.append('parent_id', currentFolderId);
      }

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            dispatch(updateUploadProgress({ progress }));
          }
        },
      });

      // Update file system state with uploaded files
      const parentKey = buildPaginationKey(currentFolderId, 'all');
      dispatch(upsertFiles({ parentKey, files: response.data.files || response.data }));

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addFilesToUpload: (state, action: PayloadAction<File[]>) => {
      const newUploads = action.payload.map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'pending' as const,
      }));
      
      state.uploads.push(...newUploads);
      state.totalFiles += newUploads.length;
      state.isPopupOpen = true;
    },
    
    updateUploadProgress: (state, action: PayloadAction<{ progress: number; fileId?: string }>) => {
      const { progress, fileId } = action.payload;
      
      if (fileId) {
        const upload = state.uploads.find(u => u.id === fileId);
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
        state.uploads.forEach(upload => {
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
    
    cancelUpload: (state, action: PayloadAction<string>) => {
      const upload = state.uploads.find(u => u.id === action.payload);
      if (upload) {
        upload.status = 'cancelled';
      }
    },
    
    removeUpload: (state, action: PayloadAction<string>) => {
      state.uploads = state.uploads.filter(u => u.id !== action.payload);
    },
    
    openUploadPopup: (state) => {
      state.isPopupOpen = true;
    },
    
    closeUploadPopup: (state) => {
      state.isPopupOpen = false;
    },
    
    clearCompletedUploads: (state) => {
      state.uploads = state.uploads.filter(u => u.status !== 'completed');
      state.completedFiles = 0;
      state.totalFiles = state.uploads.length;
    },
    
    resetUploads: () => initialState,
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(uploadFiles.pending, (state) => {
        state.uploads.forEach(upload => {
          if (upload.status === 'pending') {
            upload.status = 'uploading';
          }
        });
      })
      .addCase(uploadFiles.fulfilled, (state) => {
        state.uploads.forEach(upload => {
          if (upload.status === 'uploading') {
            upload.status = 'completed';
            upload.progress = 100;
          }
        });
        state.completedFiles = state.totalFiles;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.uploads.forEach(upload => {
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
} = uploadSlice.actions;

export default uploadSlice.reducer;
