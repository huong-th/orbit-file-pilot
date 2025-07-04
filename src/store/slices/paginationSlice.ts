import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PaginationPageState {
  isLoading: boolean;
  hasMore: boolean;
  limit: number;
  cursor?: string;
  error: string | null;
}

interface PaginationState {
  pages: Record<string, PaginationPageState>;
}

/** Hàm tạo page mặc định – export để tái sử dụng */
export const defaultPage = (limit = 50): PaginationPageState => ({
  isLoading: false,
  hasMore: true,
  limit,
  cursor: undefined,
  error: null,
});

const initialState: PaginationState = {
  pages: {},
};

const paginationSlice = createSlice({
  name: 'pagination',
  initialState,
  reducers: {
    /** Bắt đầu load (initial hoặc infinite-scroll) */
    startLoad(state, { payload }: PayloadAction<{ key: string }>) {
      state.pages[payload.key] = {
        ...defaultPage(), // đảm bảo đủ field
        ...state.pages[payload.key], // giữ cursor cũ nếu có
        isLoading: true,
      };
    },

    /** API trả về thành công */
    stopLoad(state, { payload }: PayloadAction<{ key: string; hasMore: boolean }>) {
      state.pages[payload.key] = {
        ...state.pages[payload.key],
        isLoading: false,
        hasMore: payload.hasMore,
      };
    },

    /** Lưu cursor mới */
    advanceCursor(state, { payload }: PayloadAction<{ key: string; cursor?: string }>) {
      state.pages[payload.key] = {
        ...state.pages[payload.key],
        cursor: payload.cursor,
      };
    },

    /** Lưu lỗi */
    setPageError(state, { payload }: PayloadAction<{ key: string; error: string }>) {
      state.pages[payload.key] = {
        ...state.pages[payload.key],
        error: payload.error,
        isLoading: false,
      };
    },

    /** Xoá cache của 1 key */
    resetPage(state, { payload }: PayloadAction<{ key: string }>) {
      delete state.pages[payload.key];
    },

    /** Xoá toàn bộ cache phân trang */
    clearPagination: () => initialState,
  },
});

export const { startLoad, stopLoad, advanceCursor, setPageError, resetPage, clearPagination } =
  paginationSlice.actions;

export default paginationSlice.reducer;
