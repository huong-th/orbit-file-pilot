import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { setFiles, setError, setLoading } from './searchSlice';
import type { RemoteFile } from '@/types/files';

interface SearchFilesParams {
  query: string;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const searchFiles = createAsyncThunk(
  'search/searchFiles',
  async (params: SearchFilesParams, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      const searchParams = new URLSearchParams({
        q: params.query,
        limit: (params.limit || 10).toString(),
        sort: params.sort || 'updated',
        order: params.order || 'desc',
      });

      const response = await api.get<RemoteFile[]>(`/search?${searchParams.toString()}`);
      
      dispatch(setFiles(response.data));
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to search files';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);