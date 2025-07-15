import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RemoteFile } from '@/types/files';

export interface ReportState {
  startDate: Date | null;
  endDate: Date | null;
  files: RemoteFile[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  startDate: null,
  endDate: null,
  files: [],
  isLoading: false,
  error: null,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setDateRange(state, { payload }: PayloadAction<{ startDate: Date; endDate: Date }>) {
      state.startDate = payload.startDate;
      state.endDate = payload.endDate;
    },
    setLoading(state, { payload }: PayloadAction<boolean>) {
      state.isLoading = payload;
    },
    setFiles(state, { payload }: PayloadAction<RemoteFile[]>) {
      state.files = payload;
      state.isLoading = false;
      state.error = null;
    },
    setError(state, { payload }: PayloadAction<string>) {
      state.error = payload;
      state.isLoading = false;
    },
    clearFiles(state) {
      state.files = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  setDateRange,
  setLoading,
  setFiles,
  setError,
  clearFiles,
  clearError,
} = reportSlice.actions;

export default reportSlice.reducer;