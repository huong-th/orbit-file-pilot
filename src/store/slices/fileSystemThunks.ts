import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import { upsertFiles, upsertFolder, upsertFolders } from '@/store/slices/fileSystemSlice';
import {
  startLoad,
  stopLoad,
  advanceCursor,
  setPageError,
  defaultPage,
} from '@/store/slices/paginationSlice';
import { buildPaginationKey } from '@/lib/utils';
import type { BreadcrumbItem, DriveItem, FileCategory, RemoteFolder } from '@/types/files';
import api from '@/services/api.ts';
import { navigateToFolder, upsertBreadcrumbs } from '@/store/slices/navigationSlice.ts';

/* ------------------------------------------------------------------ */
/*  Fetch FLAT list (Images, Videos, Starred, Trash)                   */
/* ------------------------------------------------------------------ */
export const fetchFlatFiles = createAsyncThunk<
  void,
  {
    category?: FileCategory;
    starred?: boolean;
    shared?: boolean;
    deleted?: boolean;
  },
  { state: RootState }
>('files/fetchFlatFiles', async (params, { dispatch, getState }) => {
  const filter = params.category ?? 'all';
  const key = buildPaginationKey('root', filter);

  const page = getState().pagination.pages[key] ?? defaultPage();
  if (page.isLoading || !page.hasMore) return;

  dispatch(startLoad({ key }));

  try {
    const { data } = await api.get('/files', {
      params: {
        ...params,
        limit: page.limit,
        cursor: page.cursor,
      },
    });

    dispatch(upsertFiles({ parentKey: key, files: data.items }));
    dispatch(advanceCursor({ key, cursor: data.nextCursor }));
    dispatch(stopLoad({ key, hasMore: Boolean(data.nextCursor) }));
  } catch (err: any) {
    dispatch(setPageError({ key, error: err.message ?? 'Unknown error' }));
  }
});

/* ------------------------------------------------------------------ */
/*  Fetch folder contents (hierarchical My‑Drive)                      */
/* ------------------------------------------------------------------ */
export const fetchFolderContents = createAsyncThunk<void, string, { state: RootState }>(
  'files/fetchFolderContents',
  async (folderId, { dispatch, getState }) => {
    const key = buildPaginationKey(folderId, 'all');
    const page = getState().pagination.pages[key] ?? defaultPage();
    if (page.isLoading || !page.hasMore) return;

    dispatch(startLoad({ key }));

    try {
      const { data } = await api.get(`/folders/${folderId}/contents`, {
        params: { limit: page.limit, cursor: page.cursor },
      });

      const folder = data.items.filter((item: DriveItem) => item.kind === 'folder');
      const files = data.items.filter((item: DriveItem) => item.kind === 'file');

      dispatch(upsertFolders({ parentKey: key, folders: folder }));
      dispatch(upsertFiles({ parentKey: key, files: files }));
      dispatch(advanceCursor({ key, cursor: data.nextCursor }));
      dispatch(stopLoad({ key, hasMore: Boolean(data.nextCursor) }));
    } catch (err: any) {
      dispatch(setPageError({ key, error: err.message ?? 'Unknown error' }));
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Create new folder (mutation)                                       */
/* ------------------------------------------------------------------ */
export const createFolder = createAsyncThunk<
  { id: string; name: string; parent_id: string | null },
  { name: string; parentId?: string | null },
  { state: RootState }
>('folders/create', async (payload, { dispatch, getState }) => {
  const { data } = await api.post('/folders', {
    name: payload.name,
    parent_id: payload.parentId ?? null,
  });

  // Add the new folder to the current view
  const currentFolderId = getState().navigation.currentFolderId;
  const key = buildPaginationKey(currentFolderId, 'all');
  
  // Ensure the folder has the 'kind' property for consistency
  const folderWithKind = { ...data, kind: 'folder' as const };
  
  dispatch(upsertFolders({ parentKey: key, folders: [folderWithKind] }));
  return data;
});

export const fetchMetadataFolder = createAsyncThunk<
  RemoteFolder,
  string,
  { state: RootState }
>('folders/fetchFolder', async (folderId, { getState, dispatch, rejectWithValue }) => {
  const cached = getState().fileSystem.folderById[folderId];
  if (cached) return cached;

  try {
    const { data } = await api.get<RemoteFolder>(`/folders/${folderId}`);
    dispatch(upsertFolder(data));
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data ?? err.message);
  }
});

export const fetchAncestors = createAsyncThunk<
  BreadcrumbItem[],
  string,
  { state: RootState }
>('folders/fetchAncestors', async (folderId, { dispatch, getState, rejectWithValue }) => {
  try {
    let pathIds = getState().navigation.breadcrumbIds[folderId];

    if (!pathIds) {
      const { data } = await api.get<RemoteFolder[]>(`/folders/${folderId}/ancestors`);
      pathIds = [...data.map((f) => f.id), folderId];
      dispatch(upsertBreadcrumbs({ folderId, path: pathIds }));
    }

    const missingIds = pathIds.filter((id) => !getState().fileSystem.folderById[id]);
    await Promise.all(missingIds.map((id) => dispatch(fetchMetadataFolder(id)).unwrap()));

    return pathIds.map((id) => {
      const folder = getState().fileSystem.folderById[id];
      return { id, name: folder?.name ?? 'Unknown' };
    });
  } catch (err: any) {
    return rejectWithValue(err.response?.data ?? err.message);
  }
});

export const changeFolder = createAsyncThunk<void, string, { state: RootState }>(
  'navigation/changeFolder',
  async (folderId, { dispatch }) => {
    dispatch(navigateToFolder({ folderId }));
    dispatch(fetchAncestors(folderId));
  }
);
