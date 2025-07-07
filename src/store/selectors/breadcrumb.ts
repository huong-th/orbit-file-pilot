import { createSelector } from '@reduxjs/toolkit';

import { ROOT_ID, ROOT_ITEM } from '@/constants';
import { RootState } from '@/store/store';

export const selectBreadcrumb = (folderId: string) =>
  createSelector(
    (s: RootState) => s.navigation.breadcrumbIds[folderId] ?? [],
    (s: RootState) => s.fileSystem.folderById,
    (ids, folders) => {
      // Bỏ 'root' nếu đã có sẵn trong ids để tránh trùng
      const withoutRoot = ids.length && ids[0] === ROOT_ID ? ids.slice(1) : ids;

      const mapped = withoutRoot.map((id) => ({
        id,
        name: folders[id]?.name ?? 'Unknown',
      }));

      // Thêm phần tử gốc ở đầu
      return [ROOT_ITEM, ...mapped];
    }
  );
