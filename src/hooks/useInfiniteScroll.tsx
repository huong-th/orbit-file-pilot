// src/hooks/useInfiniteScroll.ts
import { useCallback, useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  /** true nếu backend vẫn còn dữ liệu */
  hasMore: boolean;
  /** true khi đang call API; tránh gọi chồng */
  isLoading: boolean;
  /** hàm tải thêm – nên return Promise<void> để hook chờ kết thúc */
  onLoadMore: () => Promise<void> | void;
  /** px trước khi chạm viewport thì trigger (mặc định 200) */
  threshold?: number;
  /** root element cho observer (mặc định null = viewport) */
  root?: HTMLElement | null;
}

/**
 * Hook tiện lợi cho Infinite‑Scroll (IntersectionObserver)
 * Trả về `loadMoreRef` – gán ref này vào div sentinel.
 */
export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  root = null,
}: UseInfiniteScrollProps) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  /** tránh gọi liên tiếp khi hàm vẫn đang pending */
  const isFetchingRef = useRef(false);

  const handleIntersect: IntersectionObserverCallback = useCallback(
    (entries) => {
      const firstEntry = entries[0];
      if (!firstEntry?.isIntersecting) return;
      if (!hasMore || isLoading || isFetchingRef.current) return;

      const mayBePromise = onLoadMore();
      if (mayBePromise instanceof Promise) {
        isFetchingRef.current = true;
        mayBePromise.finally(() => {
          isFetchingRef.current = false;
        });
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root,
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0,
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [root, threshold, handleIntersect]);

  return { loadMoreRef };
};
