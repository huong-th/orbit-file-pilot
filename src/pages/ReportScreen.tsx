import { AlertCircle, Calendar, FileText } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { subMonths, startOfToday } from 'date-fns';

import FileGrid from '@/components/FileGrid';
import FileList from '@/components/FileList';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchFilesByDateRange } from '@/store/slices/reportThunks';
import { setDateRange, clearError } from '@/store/slices/reportSlice';

import type { RootState } from '@/store/store';

const ReportScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Redux selectors
  const { startDate, endDate, files, isLoading, error } = useAppSelector(
    (state: RootState) => state.report
  );
  const viewMode = useAppSelector((state: RootState) => state.navigation.viewMode);

  // Initialize date range on mount
  useEffect(() => {
    if (!startDate || !endDate) {
      const defaultStartDate = subMonths(startOfToday(), 1);
      const defaultEndDate = startOfToday();
      
      dispatch(setDateRange({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      }));
      
      // Fetch initial data
      dispatch(fetchFilesByDateRange({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      }));
    }
  }, [dispatch, startDate, endDate]);

  // Handle date range updates
  const handleDateRangeUpdate = useCallback(
    (values: { range: { from: Date; to: Date | undefined } }) => {
      const { from, to } = values.range;
      
      if (from && to) {
        dispatch(setDateRange({
          startDate: from,
          endDate: to,
        }));
        
        // Fetch files for the new date range
        dispatch(fetchFilesByDateRange({
          startDate: from,
          endDate: to,
        }));
      }
    },
    [dispatch]
  );

  // Handle error clearing
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

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
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t('reports.title', 'File Reports')}
              </h1>
              <p className="text-muted-foreground">
                {t('reports.description', 'View and analyze your uploaded files by date range')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 pb-8 min-h-0">
        <div className="space-y-6">
          {/* Date Range Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('reports.dateRange', 'Date Range')}
              </CardTitle>
              <CardDescription>
                {t('reports.dateRangeDescription', 'Select a date range to filter uploaded files')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DateRangePicker
                onUpdate={handleDateRangeUpdate}
                initialDateFrom={startDate || subMonths(startOfToday(), 1)}
                initialDateTo={endDate || startOfToday()}
                align="start"
                locale="vi-VN"
                showCompare={false}
              />
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

          {/* Stats Cards */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('reports.totalFiles', 'Total Files')}
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
                        {t('reports.totalSize', 'Total Size')}
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
                        {t('reports.images', 'Images')}
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
                        {t('reports.documents', 'Documents')}
                      </p>
                      <p className="text-2xl font-bold">{filesByCategory.documents || 0}</p>
                    </div>
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Files Display */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('reports.filesInRange', 'Files in Selected Range')}
              </CardTitle>
              <CardDescription>
                {startDate && endDate && (
                  <>
                    {t('reports.showing', 'Showing files from')} {startDate.toLocaleDateString('vi-VN')} {t('reports.to', 'to')} {endDate.toLocaleDateString('vi-VN')}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-96 rounded-lg border-2 border-dashed border-border/30 bg-card/50">
                <div className="p-6">
                  {isLoading ? (
                    <LoadingSkeleton count={12} viewMode={viewMode} />
                  ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <div className="text-6xl opacity-20 mb-4">📄</div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">
                        {t('reports.noFiles', 'No files found')}
                      </h3>
                      <p className="text-sm text-center max-w-md">
                        {t('reports.noFilesDescription', 'No files were uploaded in the selected date range.')}
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

export default ReportScreen;