import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getQueryParam } from '@/lib/utils';

export interface ViewState {
  searchQuery: string;
  currentFilter: string; // e.g. "all", "starred", "shared", "trash", etc.
  sort: 'name' | 'updated' | 'size';
  order: 'asc' | 'desc';
}

export const initialState: ViewState = {
  searchQuery: '',
  currentFilter: getQueryParam('type') || 'all', // Default to 'all' if no query param
  sort: 'updated',
  order: 'desc',
};

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setCurrentFilter(state, action: PayloadAction<string>) {
      state.currentFilter = action.payload;
    },
    setSort(state, action: PayloadAction<'name' | 'updated' | 'size'>) {
      state.sort = action.payload;
    },
    setOrder(state, action: PayloadAction<'asc' | 'desc'>) {
      state.order = action.payload;
    },
    resetView(state) {
      state.searchQuery = '';
      state.currentFilter = 'all';
      state.sort = 'updated';
      state.order = 'desc';
    },
  },
});

export const { setSearchQuery, setCurrentFilter, setSort, setOrder, resetView } = viewSlice.actions;

export default viewSlice.reducer;
