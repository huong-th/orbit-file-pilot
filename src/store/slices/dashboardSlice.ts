import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {fetchDashboardSummary} from "@/store/slices/fileSystemThunks.ts";
import { SummaryData, TrendPoint, FileTypeDistributionItem, RecentFile } from '@/types/files';

import type { RootState } from '@/store/store';
/* -------------------------------------------------------------------------- */
/*                              Slice initial state                           */
/* -------------------------------------------------------------------------- */

interface DashboardState {
  summaryData: SummaryData;
  uploadTrendsData: {
    daily: TrendPoint[];
    monthly: TrendPoint[];
  };
  fileTypeDistribution: FileTypeDistributionItem[];
  recentFiles: RecentFile[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summaryData: {
    "totalFolders": 0,
    "totalImages": 0,
    "totalVideos": 0,
    "totalDocuments": 0,
    "totalMusic": 0,
    "totalOthers": 0,
    "storageUsed": 0,
    "storageTotal": 0,
    "newUploadsThisMonth": {
      "totalFolders": 0,
      "totalImages": 0,
      "totalVideos": 0,
      "totalDocuments": 0,
      "totalMusic": 0,
      "totalOthers": 0
    }
  },
  uploadTrendsData: { daily: [], monthly: [] },
  fileTypeDistribution: [],
  recentFiles: [],
  isLoading: false,
  error: null,
};

/* -------------------------------------------------------------------------- */
/*                                   Slice                                    */
/* -------------------------------------------------------------------------- */

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    /* Thủ công: ghi đè toàn bộ summaryData (nếu cần). */
    updateSummaryData(state, action: PayloadAction<SummaryData>) {
      state.summaryData = action.payload;
    },
    /* Thêm file mới vào đầu danh sách recentFiles. */
    addRecentFile(state, action: PayloadAction<RecentFile>) {
      state.recentFiles.unshift(action.payload);
    },
    /* Xoá thông tin lỗi khi bạn muốn clear UI */
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.summaryData = payload.summaryData;
        state.uploadTrendsData = payload.uploadTrendsData;
        state.fileTypeDistribution = payload.fileTypeDistribution;
        state.recentFiles = payload.recentFiles;
      })
      .addCase(fetchDashboardSummary.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload as string;
      });
  },
});

/* -------------------------------------------------------------------------- */
/*                               Selectors                                    */
/* -------------------------------------------------------------------------- */

export const selectDashboard = (state: RootState) => state.dashboard;

/* -------------------------------------------------------------------------- */
/*                               Exports                                      */
/* -------------------------------------------------------------------------- */

export const { updateSummaryData, addRecentFile, clearError } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
