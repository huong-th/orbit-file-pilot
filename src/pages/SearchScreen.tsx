import { Search, AlertCircle, FileText } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import FileGrid from '@/components/FileGrid';
import FileList from '@/components/FileList';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { searchFiles } from '@/store/slices/searchThunks';
import { setQuery, clearError, clearSearch, setLoading } from '@/store/slices/searchSlice';

import type { RootState } from '@/store/store';

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Redux selectors
  const { query, files, isLoading, error } = useAppSelector(
    (state: RootState) => state.search
  );
  const viewMode = useAppSelector((state: RootState) => state.navigation.viewMode);

  // Initialize from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery && urlQuery !== query) {
      dispatch(setQuery(urlQuery));
      dispatch(searchFiles({ query: urlQuery }));
    }
  }, [searchParams, dispatch, query]);

  // Handle search input changes with debouncing
  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch(setQuery(value));
      
      // Update URL
      if (value) {
        setSearchParams({ q: value });
      } else {
        setSearchParams({});
      }

      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (!value.trim()) {
        dispatch(clearSearch());
        return;
      }

      // Show loading immediately when typing
      dispatch(setLoading(true));

      // Set new timeout for API call
      const newTimeout = setTimeout(() => {
        dispatch(searchFiles({ query: value.trim() }));
      }, 3000);

      setSearchTimeout(newTimeout);
    },
    [dispatch, searchTimeout, setSearchParams]
  );

  // Navigate to search screen if typing and not already there
  const handleInputFocus = useCallback(() => {
    if (window.location.pathname !== '/search') {
      navigate('/search');
    }
  }, [navigate]);

  // Handle error clearing
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Stats calculations
  const totalFiles = files.length;
  const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
  const filesByCategory = files.reduce((acc, file) => {
    const category = file.category || 'others';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-8 pb-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t('search.title', 'Search Files')}
              </h1>
              <p className="text-muted-foreground">
                {t('search.description', 'Search through your uploaded files')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 pb-8 min-h-0">
        <div className="space-y-6">
          {/* Search Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                {t('search.searchFiles', 'Search Files')}
              </CardTitle>
              <CardDescription>
                {t('search.searchDescription', 'Enter keywords to search through your files')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('search.placeholder', 'Search files...')}
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleInputFocus}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={handleClearError}>
                  {t('common.dismiss', 'Dismiss')}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards - Only show if there are results */}
          {!isLoading && files.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('search.totalFiles', 'Total Files')}
                      </p>
                      <p className="text-2xl font-bold">{totalFiles}</p>
                    </div>
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('search.totalSize', 'Total Size')}
                      </p>
                      <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
                    </div>
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('search.images', 'Images')}
                      </p>
                      <p className="text-2xl font-bold">{filesByCategory.images || 0}</p>
                    </div>
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('search.documents', 'Documents')}
                      </p>
                      <p className="text-2xl font-bold">{filesByCategory.documents || 0}</p>
                    </div>
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Results */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('search.searchResults', 'Search Results')}
              </CardTitle>
              <CardDescription>
                {query && (
                  <>
                    {t('search.searchingFor', 'Searching for')}: "{query}"
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-96 rounded-lg border-2 border-dashed border-border/30 bg-card/50">
                <div className="p-6">
                  {isLoading ? (
                    <LoadingSkeleton count={12} viewMode={viewMode} />
                  ) : !query ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <div className="text-6xl opacity-20 mb-4">🔍</div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">
                        {t('search.startSearching', 'Start searching')}
                      </h3>
                      <p className="text-sm text-center max-w-md">
                        {t('search.startSearchingDescription', 'Enter keywords in the search box above to find your files.')}
                      </p>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <div className="text-6xl opacity-20 mb-4">📄</div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">
                        {t('search.noResults', 'No data')}
                      </h3>
                      <p className="text-sm text-center max-w-md">
                        {t('search.noResultsDescription', 'No files found matching your search criteria.')}
                      </p>
                    </div>
                  ) : (
                    viewMode === 'grid' ? (
                      <FileGrid files={files} />
                    ) : (
                      <FileList files={files} />
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchScreen;