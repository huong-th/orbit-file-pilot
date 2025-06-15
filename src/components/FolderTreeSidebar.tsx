import React, { useState } from 'react';
import { useFileManager } from '../contexts/FileManagerContext';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from './ui/button';

const FolderTreeSidebar: React.FC = () => {
  const { folders, currentFolder, navigateToFolder } = useFileManager();
  const location = useLocation();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'documents']));

  const toggleFolder = (folderId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
        // Recursively collapse all child folders
        const collapseChildren = (parentId: string) => {
          const children = folders.filter(f => f.parent === parentId);
          children.forEach(child => {
            newSet.delete(child.id);
            collapseChildren(child.id);
          });
        };
        collapseChildren(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFolderClick = (folderId: string) => {
    navigateToFolder(folderId);
    // Auto-expand the clicked folder if it has children
    const folder = folders.find(f => f.id === folderId);
    if (folder && folder.children.length > 0) {
      setExpandedFolders(prev => new Set([...prev, folderId]));
    }
  };

  const renderFolderTree = (parentId: string = 'root', level: number = 0) => {
    const childFolders = folders.filter(folder => 
      folder.parent === parentId && folder.id !== 'root'
    );
    
    if (childFolders.length === 0) return null;

    return (
      <div className="space-y-0.5">
        {childFolders.map((folder) => {
          const hasChildren = folder.children.length > 0;
          const isExpanded = expandedFolders.has(folder.id);
          const isActive = currentFolder === folder.id;
          
          return (
            <div key={folder.id} className="w-full">
              <div 
                className={`flex items-center w-full group rounded-lg transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' 
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}

                {hasChildren ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mr-1 hover:bg-accent/60"
                    onClick={(e) => toggleFolder(folder.id, e)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200" />
                    )}
                  </Button>
                ) : (
                  <div className="w-6 mr-1" />
                )}
                
                <button
                  onClick={() => handleFolderClick(folder.id)}
                  className="flex items-center gap-2 flex-1 py-2 px-2 text-left text-sm font-medium rounded-md transition-all duration-200 hover:scale-[1.01]"
                >
                  <Folder className={`w-4 h-4 transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  }`} />
                  <span className={`truncate transition-all duration-200 ${
                    isActive ? 'font-semibold' : ''
                  }`}>{folder.name}</span>
                </button>
              </div>
              
              {hasChildren && (
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded 
                      ? 'max-h-96 opacity-100 transform translate-y-0' 
                      : 'max-h-0 opacity-0 transform -translate-y-2'
                  }`}
                >
                  <div className="py-1">
                    {renderFolderTree(folder.id, level + 1)}
                  </div>
                </div>
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
      <div className="px-1">
        {renderFolderTree()}
      </div>
    </div>
  );
};

export default FolderTreeSidebar;