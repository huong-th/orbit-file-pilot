import React from 'react';
import { DriveItem } from '@/types/files';
import FileCard from '@/components/FileCard';

interface FileGridProps {
  files: DriveItem[];
}

const FileGrid: React.FC<FileGridProps> = ({ files }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
};

export default FileGrid;
