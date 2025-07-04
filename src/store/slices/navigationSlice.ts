import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NavigationState {
  currentFolderId: string; // 'root' or UUID
  currentPath: string[]; // ['documents', 'projects'] (optional if you derive it)
  breadcrumbIds: Record<string, string[]>;
  viewMode: 'grid' | 'list';
}

export const initialState: NavigationState = {
  currentFolderId: 'root',
  currentPath: [],
  breadcrumbIds: {},
  viewMode: 'grid',
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    navigateToFolder(state, action: PayloadAction<{ folderId: string; path?: string[] }>) {
      state.currentFolderId = action.payload.folderId;
      if (action.payload.path) {
        state.currentPath = action.payload.path;
      }
    },
    navigateToPath(state, action: PayloadAction<string[]>) {
      state.currentPath = action.payload;
    },
    upsertBreadcrumbs(state, action: PayloadAction<{ folderId: string; path: string[] }>) {
      const { folderId, path } = action.payload;
      state.breadcrumbIds[folderId] = path;
    },
    setViewMode(state, action: PayloadAction<'grid' | 'list'>) {
      state.viewMode = action.payload;
    },
    resetNavigation(state) {
      state.currentFolderId = 'root';
      state.currentPath = [];
      state.viewMode = 'grid';
    },
  },
});

export const { navigateToFolder, navigateToPath, setViewMode, resetNavigation, upsertBreadcrumbs } =
  navigationSlice.actions;

export default navigationSlice.reducer;
