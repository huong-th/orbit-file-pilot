import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RemoteFile } from '@/types/files';

interface SearchState {
  query: string;
  files: RemoteFile[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  query: '',
  files: [],
  isLoading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setFiles: (state, action: PayloadAction<RemoteFile[]>) => {
      state.files = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearch: (state) => {
      state.query = '';
      state.files = [];
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setQuery,
  setLoading,
  setFiles,
  setError,
  clearError,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;