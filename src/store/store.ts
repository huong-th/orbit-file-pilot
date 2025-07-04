
import { configureStore } from '@reduxjs/toolkit';

// Auth & security
import authReducer from '@/store/slices/authSlice';
import passkeyReducer from '@/store/slices/passkeySlice';

// File‑manager domain
import fileSystemReducer from '@/store/slices/fileSystemSlice';
import paginationReducer from '@/store/slices/paginationSlice';
import navigationReducer, {
  initialState as navigationInitialState,
} from '@/store/slices/navigationSlice';
import viewReducer, { initialState as viewInitialState } from '@/store/slices/viewSlice';
import uiReducer from '@/store/slices/uiSlice.ts';
import uploadReducer from '@/store/slices/uploadSlice';

const searchParams = new URLSearchParams(window.location.search);
const urlFilter = searchParams.get('filter');
const urlFolderId = window.location.pathname.split('/').pop();

export const store = configureStore({
  reducer: {
    // Security / user
    auth: authReducer,
    passkey: passkeyReducer,

    // File system & UI
    fileSystem: fileSystemReducer,
    pagination: paginationReducer,
    navigation: navigationReducer,
    view: viewReducer,
    ui: uiReducer,
    upload: uploadReducer,
  },
  preloadedState: {
    navigation: {
      ...navigationInitialState,
      currentFolderId: urlFolderId ?? navigationInitialState.currentFolderId,
    },
    view: {
      ...viewInitialState,
      currentFilter: urlFilter ?? viewInitialState.currentFilter,
    },
  },
});

// 🛠️  Typed hooks helpers (optional but common)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
