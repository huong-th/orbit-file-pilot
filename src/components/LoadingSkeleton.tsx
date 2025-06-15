import React from 'react';
import { Skeleton } from './ui/skeleton';

interface LoadingSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  count = 6, 
  viewMode = 'grid' 
}) => {
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-card/30">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="group p-4 rounded-2xl bg-card/30 border border-border/20 hover:shadow-lg transition-all duration-200">
          <div className="space-y-3">
            <div className="flex items-center justify-center h-20 w-full rounded-xl bg-muted/50">
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;