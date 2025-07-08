import { configureStore } from '@reduxjs/toolkit';

// Auth & security
import authReducer from '@/store/slices/authSlice';

// File‑manager domain
import dashboardReducer from '@/store/slices/dashboardSlice';
import fileSystemReducer from '@/store/slices/fileSystemSlice';
import { fetchAncestors } from '@/store/slices/fileSystemThunks.ts';
import navigationReducer, {
  initialState as navigationInitialState,
} from '@/store/slices/navigationSlice';
import paginationReducer from '@/store/slices/paginationSlice';
import passkeyReducer from '@/store/slices/passkeySlice';
import uiReducer from '@/store/slices/uiSlice.ts';
import uploadReducer from '@/store/slices/uploadSlice';
import viewReducer, { initialState as viewInitialState } from '@/store/slices/viewSlice';


const searchParams = new URLSearchParams(window.location.search);
const urlFilter = searchParams.get('filter');
const urlFolderId = window.location.pathname.split('/').pop() || 'root';

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
    dashboard: dashboardReducer,
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

// Auto-fetch breadcrumbs if we start with a specific folder ID
if (urlFolderId && urlFolderId !== 'root' && window.location.pathname.startsWith('/folder/')) {
  store.dispatch(fetchAncestors(urlFolderId));
}

// 🛠️  Typed hooks helpers (optional but common)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
