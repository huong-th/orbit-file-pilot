// src/components/FolderTreeSidebar.tsx
import React, { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, Folder as FolderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { navigateToFolder } from '@/store/slices/navigationSlice';
import type { RootState } from '@/store/store.ts';
import type { RemoteFolder } from '@/types/files';

/**
 * FolderTreeSidebar renders a collapsible folder hierarchy based on
 * normalised Redux state (`folderById`, `foldersByFolder`).
 */
const FolderTreeSidebar: React.FC = () => {
  const dispatch = useAppDispatch();

  /* ------------------------------------------------------------- */
  /*  Select folders from store                                    */
  /* ------------------------------------------------------------- */
  const folderById = useAppSelector((s: RootState) => s.fileSystem.folderById);
  const currentFolderId = useAppSelector((s: RootState) => s.navigation.currentFolderId);

  /**
   * Build parent → children map in O(n)
   * root ID is represented by the string `'root'` (null parent)
   */
  const folderMap = useMemo<Record<string, RemoteFolder[]>>(() => {
    const map: Record<string, RemoteFolder[]> = {};
    Object.values(folderById).forEach((f) => {
      const parent = f.parent_id ?? 'root';
      (map[parent] = map[parent] ?? []).push(f);
    });
    // optional alphabetical sort
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));
    return map;
  }, [folderById]);

  /* ------------------------------------------------------------- */
  /*  UI state: which folders are expanded                         */
  /* ------------------------------------------------------------- */
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));

  const toggleFolder = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleNavigate = (id: string) => {
    dispatch(navigateToFolder({ folderId: id }));
  };

  /* ------------------------------------------------------------- */
  /*  Recursive render                                             */
  /* ------------------------------------------------------------- */
  const renderTree = (parentId: string = 'root', depth = 0): React.ReactNode => {
    const children = folderMap[parentId] ?? [];
    if (children.length === 0) return null;

    return (
      <div className="space-y-0.5">
        {children.map((folder) => {
          const hasChildren = (folderMap[folder.id] ?? []).length > 0;
          const isExpanded = expanded.has(folder.id);
          const isActive = currentFolderId === folder.id;

          return (
            <div key={folder.id} className="w-full">
              <div
                className={`flex items-center w-full group rounded-lg transition-all relative ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
              >
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mr-1 hover:bg-accent/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(folder.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </Button>
                ) : (
                  <div className="w-6 mr-1" />
                )}

                <button
                  onClick={() => handleNavigate(folder.id)}
                  className="flex items-center gap-2 flex-1 py-2 px-2 text-left text-sm font-medium rounded-md hover:scale-[1.01]"
                >
                  <FolderIcon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  <span className={`truncate ${isActive ? 'font-semibold' : ''}`}>
                    {folder.name}
                  </span>
                </button>
              </div>

              {hasChildren && isExpanded && (
                <div className="py-1">{renderTree(folder.id, depth + 1)}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Folders
        </h3>
      </div>
      <div className="px-1">{renderTree()}</div>
    </div>
  );
};

export default FolderTreeSidebar;
