
import React from 'react';
import { FileItem } from '../contexts/FileManagerContext';
import { useFileManager } from '../contexts/FileManagerContext';
import { MoreHorizontal, Download, Edit, Trash2, Share, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface FileCardProps {
  file: FileItem;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const { setCurrentFolder, setPreviewFile, setRenameItem, setDeleteItems, openModal } = useFileManager();

  const handleFileClick = () => {
    if (file.type === 'folder') {
      setCurrentFolder(file.id);
    } else {
      setPreviewFile(file);
      openModal('preview');
    }
  };

  const handleRename = () => {
    setRenameItem(file);
    openModal('rename');
  };

  const handleDelete = () => {
    setDeleteItems([file]);
    openModal('delete');
  };

  const getFileTypeBadge = () => {
    if (file.type === 'folder') return 'Folder';
    const extension = file.name.split('.').pop()?.toUpperCase();
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'].includes(extension || '')) return 'Image';
    if (['MP4', 'AVI', 'MOV', 'WMV', 'MKV'].includes(extension || '')) return 'Video';
    if (['PDF'].includes(extension || '')) return 'PDF';
    if (['DOC', 'DOCX'].includes(extension || '')) return 'Word';
    if (['XLS', 'XLSX'].includes(extension || '')) return 'Excel';
    return extension || 'File';
  };

  const isImageFile = () => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '');
  };

  const isVideoFile = () => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm', 'm4v', '3gp'].includes(extension || '');
  };

  return (
    <div className="group relative glass-card rounded-xl border border-border/40 hover:border-primary/50 cursor-pointer overflow-hidden hover:scale-[1.03] transition-all duration-300 hover-lift">
      {/* File Type Badge */}
      <div className="absolute top-2 left-2 z-20">
        <Badge 
          variant="secondary" 
          className="text-xs px-2 py-1 bg-background/80 backdrop-blur-sm border border-border/50 text-foreground/80 font-medium"
        >
          {getFileTypeBadge()}
        </Badge>
      </div>

      {/* Quick Actions - visible on hover */}
      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 bg-background/90 backdrop-blur-sm hover:bg-primary/20 shadow-sm border border-border/30"
          onClick={(e) => {
            e.stopPropagation();
            handleFileClick();
          }}
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 bg-background/90 backdrop-blur-sm hover:bg-primary/20 shadow-sm border border-border/30"
          onClick={(e) => {
            e.stopPropagation();
            // Handle share action
          }}
        >
          <Share className="w-3.5 h-3.5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 bg-background/90 backdrop-blur-sm hover:bg-primary/20 shadow-sm border border-border/30"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-subtle border border-border/50">
            <DropdownMenuItem className="cursor-pointer" onClick={handleFileClick}>
              <Download className="w-4 h-4 mr-2" />
              {file.type === 'folder' ? 'Open' : 'Download'}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleRename}>
              <Edit className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4" onClick={handleFileClick}>
        {/* File preview/thumbnail */}
        <div className="aspect-square bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 rounded-xl flex items-center justify-center mb-3 group-hover:scale-[1.02] transition-all duration-300 shadow-inner border border-border/20 relative overflow-hidden">
          {file.thumbnail ? (
            <div className="relative w-full h-full">
              <img 
                src={file.thumbnail} 
                alt={file.name}
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
                loading="lazy"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Video play overlay */}
              {isVideoFile() && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-0 h-0 border-l-[8px] border-l-black border-y-[6px] border-y-transparent ml-1"></div>
                  </div>
                </div>
              )}
              {/* Fallback icon for failed thumbnail loads */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center" style={{ display: 'none' }}>
                <div className="text-4xl opacity-80">{file.icon}</div>
              </div>
            </div>
          ) : isImageFile() || isVideoFile() ? (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-4xl opacity-80">{file.icon}</div>
              <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
            </div>
          ) : (
            <div className="text-5xl opacity-90 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              {file.icon}
            </div>
          )}
        </div>
        
        {/* File info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-foreground truncate leading-tight font-display">
            {file.name}
          </h3>
          {/* Video subtitle */}
          {isVideoFile() && file.subtitle && (
            <p className="text-xs text-muted-foreground truncate opacity-75">
              {file.subtitle}
            </p>
          )}
          {/* Video description */}
          {isVideoFile() && file.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-90">
              {file.description}
            </p>
          )}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="truncate font-medium">{file.size || 'Folder'}</div>
            <div className="truncate opacity-80">{file.lastModified}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
