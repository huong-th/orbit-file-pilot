import { Loader } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';
import FileGrid from '@/components/FileGrid';
import FileList from '@/components/FileList';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import MusicPlaylist from '@/components/MusicPlaylist';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { buildPaginationKey } from '@/lib/utils';
import { fetchFolderContents, fetchFlatFiles } from '@/store/slices/fileSystemThunks';
import { defaultPage } from '@/store/slices/paginationSlice';

import type { RootState } from '@/store/store.ts';

interface MainContentProps {
  sidebarOpen: boolean; // prop giữ nguyên dù hiện chưa dùng
}

const MainContent: React.FC<MainContentProps> = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  /* ────────────── selectors ────────────── */
  const viewMode = useAppSelector((s: RootState) => s.navigation.viewMode);
  const currentFolderId = useAppSelector((s: RootState) => s.navigation.currentFolderId);
  const currentFilter = useAppSelector((s: RootState) => s.view.currentFilter);
  const searchQuery = useAppSelector((s: RootState) => s.view.searchQuery);

  // Khóa cache/phân trang
  const key = buildPaginationKey(currentFolderId, currentFilter);

  // Lấy IDs & map qua object
  const fileIds = useAppSelector((s: RootState) => s.fileSystem.filesByFolder[key] ?? []);
  const files = useAppSelector((s: RootState) =>
    fileIds.map((id) => s.fileSystem.fileById[id]).filter(Boolean)
  );

  const folderIds = useAppSelector((s: RootState) => s.fileSystem.foldersByFolder[key] ?? []);
  const folders = useAppSelector((s: RootState) =>
    folderIds.map((id) => s.fileSystem.folderById[id]).filter(Boolean)
  );

  const driveItems = useMemo(() => [...folders, ...files], [folders, files]);

  // Trạng thái phân trang
  const { isLoading, hasMore } = useAppSelector(
    (s: RootState) => s.pagination.pages[key] ?? defaultPage()
  );

  /* ────────────── initial fetch ────────────── */
  useEffect(() => {
    if (driveItems.length === 0 && !isLoading) {
      if (currentFilter !== 'all') {
        dispatch(fetchFlatFiles({ category: currentFilter as any }));
      } else {
        dispatch(fetchFolderContents(currentFolderId));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /* ────────────── infinite scroll ────────────── */
  const onLoadMore = React.useCallback(async () => {
    if (currentFilter !== 'all') {
      await dispatch(fetchFlatFiles({ category: currentFilter as any }));
    } else {
      await dispatch(fetchFolderContents(currentFolderId));
    }
  }, [dispatch, currentFilter, currentFolderId]);

  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore,
    threshold: 200,
  });

  /* ────────────── music special view ────────────── */
  if (currentFilter === 'music') {
    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="p-8 pb-6 flex-shrink-0">
          <BreadcrumbNavigation />
        </div>
        <div className="flex-1 overflow-auto px-8 pb-8 min-h-0">
          <div className="h-full min-h-96 rounded-2xl border-2 border-dashed border-border/30 bg-card/50 backdrop-blur-sm">
            <div className="p-8 h-full">
              <MusicPlaylist />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────── normal file/folder view ────────────── */
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-8 pb-6 flex-shrink-0">
        <BreadcrumbNavigation />
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8 min-h-0">
        <div className="h-full min-h-96 rounded-2xl border-2 border-dashed border-border/30 bg-card/50 backdrop-blur-sm">
          <div className="p-8 h-full">
            {driveItems.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="text-8xl opacity-20 mb-8">📁</div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {searchQuery ? t('fileManager.noSearchResults') : t('fileManager.emptyFolder')}
                </h3>
                <p className="text-sm text-center max-w-md leading-relaxed">
                  {searchQuery
                    ? t('fileManager.noSearchResultsDescription')
                    : t('fileManager.emptyFolderDescription')}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {driveItems.length > 0 &&
                  (viewMode === 'grid' ? (
                    <FileGrid files={driveItems} />
                  ) : (
                    <FileList files={driveItems} />
                  ))}

                {driveItems.length === 0 && isLoading && (
                  <LoadingSkeleton count={20} viewMode={viewMode} />
                )}

                {(hasMore || isLoading) && driveItems.length > 0 && (
                  <div ref={loadMoreRef} className="py-8 text-center">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3 text-muted-foreground">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-medium">{t('fileManager.loadingMore')}</span>
                      </div>
                    ) : (
                      <div className="h-8" />
                    )}
                  </div>
                )}

                {!hasMore && !isLoading && driveItems.length > 0 && (
                  <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                    {t('fileManager.endOfList')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
