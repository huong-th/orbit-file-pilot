import { formatDistanceToNow, parseISO } from 'date-fns';
import { MoreHorizontal, Download, Edit, Trash2, Share, Eye, Clock, HardDrive } from 'lucide-react';
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

interface FileListProps {
  files: DriveItem[];
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleFileClick = (file: DriveItem) => {
    if (file.kind === 'folder') {
      dispatch(changeFolder(file.id));
      navigate(`/folder/${file.id}`);
    } else {
      dispatch(setPreviewFile(file));
      dispatch(openModal('preview'));
    }
  };

  const handleRename = (file: DriveItem) => {
    dispatch(setRenameItem(file));
    dispatch(openModal('rename'));
  };

  const handleDelete = (file: DriveItem) => {
    dispatch(setDeleteItems([file]));
    dispatch(openModal('delete'));
  };

  const getFileTypeBadge = (file: DriveItem) => {
    if (file.kind === 'folder') return 'Folder';
    const extension = file.name.split('.').pop()?.toUpperCase();
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'].includes(extension || '')) return 'Image';
    if (['MP4', 'AVI', 'MOV', 'WMV', 'MKV'].includes(extension || '')) return 'Video';
    if (['PDF'].includes(extension || '')) return 'PDF';
    if (['DOC', 'DOCX'].includes(extension || '')) return 'Word';
    if (['XLS', 'XLSX'].includes(extension || '')) return 'Excel';
    return extension || 'File';
  };

  const isImageFile = (file: DriveItem) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '');
  };

  const isVideoFile = (file: DriveItem) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return ['mp4', 'avi', 'mov', 'wmv', 'mkv'].includes(extension || '');
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 rounded-lg border border-border/40">
        <div className="flex-1 min-w-0">Name</div>
        <div className="w-24 hidden sm:block">Size</div>
        <div className="w-32 hidden md:block">Modified</div>
        <div className="w-20 hidden lg:block">Type</div>
        <div className="w-16">Actions</div>
      </div>

      {/* File Rows */}
      <div className="space-y-1">
        {files.map((file, index) => (
          <div
            key={file.id}
            className={`group relative glass-card rounded-lg border border-border/30 transition-all duration-200 cursor-pointer hover:border-primary/40 hover:shadow-sm ${
              index % 2 === 0 ? 'bg-background/80' : 'bg-muted/20'
            } hover:bg-accent/20`}
            onClick={() => handleFileClick(file)}
          >
            <div className="flex items-center gap-4 p-4">
              {/* File Icon & Name */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                {/* Icon/Thumbnail */}
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center border border-border/20 shadow-sm">
                  {isImageFile(file) || isVideoFile(file) ? (
                    <div className="text-lg opacity-80">{/* Thumbnail placeholder */}</div>
                  ) : (
                    <div className="text-lg">{/* Generic icon placeholder */}</div>
                  )}
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-foreground truncate font-display">
                      {file.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5 bg-background/60 border-border/50 text-muted-foreground hidden sm:inline-flex"
                    >
                      {getFileTypeBadge(file)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {file.kind === 'folder' ? 'Folder' : `${getFileTypeBadge(file)} file`}
                  </p>
                </div>
              </div>

              {/* Size */}
              <div className="w-24 hidden sm:flex items-center">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>
                    {(file.kind === 'file' && convertAndFindLargestUnit(file.size)) || '-'}
                  </span>
                </div>
              </div>

              {/* Modified Date */}
              <div className="w-32 hidden md:flex items-center">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDistanceToNow(parseISO(file.updatedAt), { addSuffix: true })}</span>
                </div>
              </div>

              {/* File Type Badge (Large screens) */}
              <div className="w-20 hidden lg:block">
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
                >
                  {getFileTypeBadge(file)}
                </Badge>
              </div>

              {/* Quick Actions */}
              <div className="w-16 flex items-center justify-end">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm hover:bg-primary/20 shadow-sm border border-border/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileClick(file);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm hover:bg-primary/20 shadow-sm border border-border/30"
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
                        className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm hover:bg-primary/20 shadow-sm border border-border/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="glass-subtle border border-border/50"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileClick(file);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {file.kind === 'folder' ? 'Open' : 'Download'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(file);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
