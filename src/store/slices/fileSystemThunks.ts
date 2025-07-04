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
  // const filter = categoryKey(params.category ?? 'all');          // images | videos | …
  const filter = params.category ?? 'all'; // images | videos | …
  const key = buildPaginationKey('root', filter); // flat-images, ...

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
    const key = buildPaginationKey(folderId, 'all'); // folder-<id>
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
>('folders/create', async (payload, { dispatch }) => {
  const { data } = await api.post('/folders', {
    name: payload.name,
    parent_id: payload.parentId ?? null,
  });

  const key = buildPaginationKey(payload.parentId ?? 'root', 'all');
  dispatch(upsertFolders({ parentKey: key, folders: [data] }));
  return data;
});

/**
 * Lấy chi tiết 1 thư mục (GET /folders/:id)
 * - Nếu đã có trong cache -> trả về luôn (không gọi mạng)
 * - Nếu chưa có -> gọi API, lưu vào store rồi trả data
 */
export const fetchMetadataFolder = createAsyncThunk<
  RemoteFolder, // payload trả về
  string, // tham số đầu vào: folderId
  { state: RootState }
>('folders/fetchFolder', async (folderId, { getState, dispatch, rejectWithValue }) => {
  /* 1️⃣ ĐÃ CÓ TRONG CACHE */
  const cached = getState().fileSystem.folderById[folderId];
  if (cached) return cached;

  /* 2️⃣ GỌI API */
  try {
    const { data } = await api.get<RemoteFolder>(`/folders/${folderId}`);

    // Lưu vào store (tuỳ slice của bạn: upsert 1 item là đủ)
    dispatch(upsertFolder(data));

    return data; // trả về để extraReducers có thể dùng
  } catch (err: any) {
    // Bắt lỗi “đẹp” để rejected action có payload
    return rejectWithValue(err.response?.data ?? err.message);
  }
});

/* ------------------------------------------------------------------ */
/*  Thunk lấy đường dẫn tổ tiên + bảo đảm có metadata                  */
/* ------------------------------------------------------------------ */
export const fetchAncestors = createAsyncThunk<
  BreadcrumbItem[], // 👈 payload của action fulfilled
  string, //   tham số khi dispatch: folderId
  { state: RootState }
>('folders/fetchAncestors', async (folderId, { dispatch, getState, rejectWithValue }) => {
  try {
    /* 1️⃣ Lấy hoặc cache mảng id */
    let pathIds = getState().navigation.breadcrumbIds[folderId];

    if (!pathIds) {
      const { data } = await api.get<RemoteFolder[]>(`/folders/${folderId}/ancestors`);
      pathIds = [...data.map((f) => f.id), folderId];
      dispatch(upsertBreadcrumbs({ folderId, path: pathIds }));
    }

    /* 2️⃣ Bổ sung metadata còn thiếu (song song) */
    const missingIds = pathIds.filter((id) => !getState().fileSystem.folderById[id]);
    await Promise.all(missingIds.map((id) => dispatch(fetchMetadataFolder(id)).unwrap()));

    /* 3️⃣ Trả về mảng object {id,name} */
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
    // 1. cập-nhật state hiện tại
    dispatch(navigateToFolder({ folderId }));

    // 2. đặt ngay breadcrumb (cache + metadata)
    dispatch(fetchAncestors(folderId));
    // 3. tuỳ UI: bạn cũng có thể prefetch contents
    // dispatch(fetchFolderContents(folderId));
  }
);
