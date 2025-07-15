import { createAsyncThunk } from '@reduxjs/toolkit';

import api from '@/services/api';
import type { RemoteFile } from '@/types/files';

import { setError, setFiles, setLoading } from './reportSlice';

export interface FetchFilesByDateRangeParams {
  startDate: Date;
  endDate: Date;
}

export const fetchFilesByDateRange = createAsyncThunk<
  void,
  FetchFilesByDateRangeParams,
  { rejectValue: string }
>(
  'report/fetchFilesByDateRange',
  async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const response = await api.get('/files', {
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          limit: 1000, // Adjust as needed
        },
      });

      const files: RemoteFile[] = response.data.files || [];
      dispatch(setFiles(files));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch files';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);