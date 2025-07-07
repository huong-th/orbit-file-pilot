import { formatDistanceToNow, parseISO } from 'date-fns';
import { MoreHorizontal, Download, Edit, Trash2, Share, Eye } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch } from '@/hooks/redux.ts';
import { convertAndFindLargestUnit } from '@/lib/utils';
import { changeFolder } from '@/store/slices/fileSystemThunks.ts';
import { openModal, setPreviewFile, setRenameItem, setDeleteItems } from '@/store/slices/uiSlice';

import type { DriveItem } from '@/types/files';

interface FileCardProps {
  file: DriveItem;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isFolder = file.kind === 'folder';

  const handleFileClick = () => {
    if (isFolder) {
      dispatch(changeFolder(file.id));
      navigate(`/folder/${file.id}`);
    } else {
      dispatch(setPreviewFile(file));
      dispatch(openModal('preview'));
    }
  };

  const handleRename = () => {
    dispatch(setRenameItem(file));
    dispatch(openModal('rename'));
  };

  const handleDelete = () => {
    dispatch(setDeleteItems([file]));
    dispatch(openModal('delete'));
  };

  const getFileTypeBadge = () => {
    if (isFolder) return 'Folder';
    const extension = file.name.split('.').pop()?.toUpperCase();
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'].includes(extension || '')) return 'Image';
    if (['MP4', 'AVI', 'MOV', 'WMV', 'MKV', 'WEBM', 'M4V', '3GP'].includes(extension || ''))
      return 'Video';
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

      {/* Quick Actions */}
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
            // TODO: Share action
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
              {isFolder ? 'Open' : 'Download'}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleRename}>
              <Edit className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4" onClick={handleFileClick}>
        {/* Thumbnail */}
        <div className="aspect-square bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 rounded-xl flex items-center justify-center mb-3 group-hover:scale-[1.02] transition-all duration-300 shadow-inner border border-border/20 relative overflow-hidden">
          {file.kind === 'file' && file.thumbnailUrl ? (
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
              loading="lazy"
            />
          ) : (
            <div className="text-5xl opacity-90 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              {/* Placeholder icon */}
              📁
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-foreground truncate leading-tight font-display">
            {file.name}
          </h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="truncate font-medium">
              {isFolder ? 'Folder' : convertAndFindLargestUnit(file.size)}
            </div>
            <div className="truncate opacity-80">
              {formatDistanceToNow(parseISO(file.updatedAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
