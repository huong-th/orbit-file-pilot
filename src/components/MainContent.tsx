
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFileManager } from '../contexts/FileManagerContext';
import FileGrid from './FileGrid';
import FileList from './FileList';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import LoadingSkeleton from './LoadingSkeleton';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { Loader } from 'lucide-react';

interface MainContentProps {
  sidebarOpen: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ sidebarOpen }) => {
  const { 
    viewMode, 
    displayedFiles, 
    isLoading, 
    hasMore, 
    loadMoreFiles, 
    searchQuery 
  } = useFileManager();
  const { t } = useTranslation();

  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMoreFiles,
    threshold: 200
  });

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-8 pb-6 flex-shrink-0">
        <BreadcrumbNavigation />
      </div>
      
      <div className="flex-1 overflow-auto px-8 pb-8 min-h-0" id="scroll-container">
        {/* Modern drag and drop area */}
        <div className="h-full min-h-96 rounded-2xl border-2 border-dashed border-border/30 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg group">
          <div className="p-8 h-full">
            {displayedFiles.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="relative mb-8">
                  <div className="text-8xl opacity-20 group-hover:opacity-30 transition-opacity duration-300">📁</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-2xl group-hover:from-primary/20 transition-all duration-300"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {searchQuery ? t('fileManager.noSearchResults') : t('fileManager.emptyFolder')}
                </h3>
                <p className="text-sm text-center max-w-md leading-relaxed">
                  {searchQuery 
                    ? t('fileManager.noSearchResultsDescription')
                    : t('fileManager.emptyFolderDescription')
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Content */}
                {displayedFiles.length > 0 && (
                  <>
                    {viewMode === 'grid' ? (
                      <FileGrid files={displayedFiles} />
                    ) : (
                      <FileList files={displayedFiles} />
                    )}
                  </>
                )}

                {/* Loading Skeleton for Initial Load */}
                {displayedFiles.length === 0 && isLoading && (
                  <LoadingSkeleton count={20} viewMode={viewMode} />
                )}

                {/* Load More Trigger */}
                {(hasMore || isLoading) && displayedFiles.length > 0 && (
                  <div ref={loadMoreRef} className="py-8">
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

                {/* End of Results */}
                {!hasMore && !isLoading && displayedFiles.length > 0 && (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <span className="text-sm">{t('fileManager.endOfList')}</span>
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
