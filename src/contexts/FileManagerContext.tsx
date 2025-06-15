
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  lastModified: string;
  icon: string;
  parent?: string;
  path: string; // Full path like "documents/projects/2024"
  thumbnail?: string; // Optional thumbnail URL for images
  videoUrl?: string; // Optional video URL for videos
  description?: string; // Optional description for videos
  subtitle?: string; // Optional subtitle for videos
}

export interface Folder {
  id: string;
  name: string;
  parent?: string;
  children: string[];
  path: string; // Full path like "documents/projects"
}

interface FileManagerContextType {
  files: FileItem[];
  folders: Folder[];
  currentFolder: string;
  currentPath: string[];
  viewMode: 'grid' | 'list';
  selectedItems: string[];
  searchQuery: string;
  modals: {
    createFolder: boolean;
    upload: boolean;
    preview: boolean;
    rename: boolean;
    delete: boolean;
  };
  previewFile: FileItem | null;
  renameItem: FileItem | null;
  deleteItems: FileItem[];
  // Pagination
  displayedFiles: FileItem[];
  isLoading: boolean;
  hasMore: boolean;
  loadMoreFiles: () => Promise<void>;
  resetPagination: () => void;
  // Methods
  setCurrentFolder: (folderId: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSelectedItems: (items: string[]) => void;
  setSearchQuery: (query: string) => void;
  openModal: (modal: keyof FileManagerContextType['modals']) => void;
  closeModal: (modal: keyof FileManagerContextType['modals']) => void;
  setPreviewFile: (file: FileItem | null) => void;
  setRenameItem: (item: FileItem | null) => void;
  setDeleteItems: (items: FileItem[]) => void;
  searchFiles: (query: string) => Promise<FileItem[]>;
  navigateToFolder: (folderId: string) => void;
  navigateToPath: (pathArray: string[]) => void;
  setCurrentFilter: (filter: string) => void;
  currentFilter: string;
  getBreadcrumbs: () => { id: string; name: string; path: string[] }[];
}

const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

// Create nested folder structure
const createNestedFolders = (): Folder[] => {
  return [
    {
      id: 'root',
      name: 'My Drive',
      path: '',
      children: ['documents', 'pictures', 'videos', 'music', 'downloads']
    },
    // Documents folder structure
    {
      id: 'documents',
      name: 'Documents',
      parent: 'root',
      path: 'documents',
      children: ['projects', 'personal', 'work']
    },
    {
      id: 'projects',
      name: 'Projects',
      parent: 'documents',
      path: 'documents/projects',
      children: ['2024', 'archived']
    },
    {
      id: '2024',
      name: '2024',
      parent: 'projects',
      path: 'documents/projects/2024',
      children: ['reports', 'presentations', 'research']
    },
    {
      id: 'reports',
      name: 'Reports',
      parent: '2024',
      path: 'documents/projects/2024/reports',
      children: ['q1', 'q2', 'q3', 'q4']
    },
    {
      id: 'q1',
      name: 'Q1',
      parent: 'reports',
      path: 'documents/projects/2024/reports/q1',
      children: []
    },
    {
      id: 'q2',
      name: 'Q2',
      parent: 'reports',
      path: 'documents/projects/2024/reports/q2',
      children: []
    },
    {
      id: 'presentations',
      name: 'Presentations',
      parent: '2024',
      path: 'documents/projects/2024/presentations',
      children: []
    },
    {
      id: 'research',
      name: 'Research',
      parent: '2024',
      path: 'documents/projects/2024/research',
      children: []
    },
    {
      id: 'archived',
      name: 'Archived',
      parent: 'projects',
      path: 'documents/projects/archived',
      children: ['2023', '2022']
    },
    {
      id: '2023',
      name: '2023',
      parent: 'archived',
      path: 'documents/projects/archived/2023',
      children: []
    },
    {
      id: 'personal',
      name: 'Personal',
      parent: 'documents',
      path: 'documents/personal',
      children: ['taxes', 'insurance', 'medical']
    },
    {
      id: 'work',
      name: 'Work',
      parent: 'documents',
      path: 'documents/work',
      children: ['contracts', 'invoices', 'meetings']
    },
    // Pictures folder structure
    {
      id: 'pictures',
      name: 'Pictures',
      parent: 'root',
      path: 'pictures',
      children: ['vacation', 'family', 'events']
    },
    {
      id: 'vacation',
      name: 'Vacation',
      parent: 'pictures',
      path: 'pictures/vacation',
      children: ['2024-summer', '2023-winter']
    },
    // Other root folders
    {
      id: 'videos',
      name: 'Videos',
      parent: 'root',
      path: 'videos',
      children: ['tutorials', 'recordings']
    },
    {
      id: 'music',
      name: 'Music',
      parent: 'root',
      path: 'music',
      children: ['playlists', 'albums']
    },
    {
      id: 'downloads',
      name: 'Downloads',
      parent: 'root',
      path: 'downloads',
      children: []
    }
  ];
};

// Generate files for different folders
const generateNestedFiles = (): FileItem[] => {
  const files: FileItem[] = [];
  
  // Root level files and folders (folders are created as FileItems for display)
  const mockFolders = createNestedFolders();
  const rootFolders = ['documents', 'pictures', 'videos', 'music', 'downloads'];
  rootFolders.forEach((folderId, index) => {
    const folder = mockFolders.find(f => f.id === folderId);
    if (folder) {
      files.push({
        id: folderId,
        name: folder.name,
        type: 'folder',
        lastModified: ['1 day ago', '2 days ago', '1 week ago', '3 days ago', '5 days ago'][index],
        icon: '📁',
        parent: 'root',
        path: ''
      });
    }
  });

  files.push(
    {
      id: 'file-1',
      name: 'Getting Started.pdf',
      type: 'file',
      size: '2.5 MB',
      lastModified: '2 hours ago',
      icon: '📄',
      parent: 'root',
      path: ''
    },
    {
      id: 'file-2',
      name: 'README.txt',
      type: 'file',
      size: '1.2 KB',
      lastModified: '1 day ago',
      icon: '📝',
      parent: 'root',
      path: ''
    }
  );

  // Documents folder subfolders
  const docFolders = ['projects', 'personal', 'work'];
  docFolders.forEach((folderId, index) => {
    const folder = mockFolders.find(f => f.id === folderId);
    if (folder) {
      files.push({
        id: folderId,
        name: folder.name,
        type: 'folder',
        lastModified: ['2 weeks ago', '1 month ago', '3 weeks ago'][index],
        icon: '📁',
        parent: 'documents',
        path: 'documents'
      });
    }
  });

  // Projects folder subfolders
  const projFolders = ['2024', 'archived'];
  projFolders.forEach((folderId, index) => {
    const folder = mockFolders.find(f => f.id === folderId);
    if (folder) {
      files.push({
        id: folderId,
        name: folder.name,
        type: 'folder',
        lastModified: ['1 week ago', '6 months ago'][index],
        icon: '📁',
        parent: 'projects',
        path: 'documents/projects'
      });
    }
  });

  // 2024 folder subfolders
  const year2024Folders = ['reports', 'presentations', 'research'];
  year2024Folders.forEach((folderId, index) => {
    const folder = mockFolders.find(f => f.id === folderId);
    if (folder) {
      files.push({
        id: folderId,
        name: folder.name,
        type: 'folder',
        lastModified: ['3 days ago', '1 week ago', '2 weeks ago'][index],
        icon: '📁',
        parent: '2024',
        path: 'documents/projects/2024'
      });
    }
  });

  // Reports folder subfolders
  const reportsFolders = ['q1', 'q2', 'q3', 'q4'];
  reportsFolders.forEach((folderId, index) => {
    const folder = mockFolders.find(f => f.id === folderId);
    if (folder) {
      files.push({
        id: folderId,
        name: folder.name,
        type: 'folder',
        lastModified: ['1 day ago', '1 week ago', '2 weeks ago', '3 weeks ago'][index],
        icon: '📁',
        parent: 'reports',
        path: 'documents/projects/2024/reports'
      });
    }
  });

  // Pictures folder subfolders
  const picFolders = ['vacation', 'family', 'events'];
  picFolders.forEach((folderId, index) => {
    const folder = mockFolders.find(f => f.id === folderId);
    if (folder) {
      files.push({
        id: folderId,
        name: folder.name,
        type: 'folder',
        lastModified: ['2 months ago', '3 months ago', '1 month ago'][index],
        icon: '📁',
        parent: 'pictures',
        path: 'pictures'
      });
    }
  });

  // Documents/Projects/2024/Reports/Q1 files
  files.push(
    {
      id: 'file-3',
      name: 'Q1 Financial Report.pdf',
      type: 'file',
      size: '5.8 MB',
      lastModified: '3 days ago',
      icon: '📊',
      parent: 'q1',
      path: 'documents/projects/2024/reports/q1'
    },
    {
      id: 'file-4',
      name: 'Sales Analysis.xlsx',
      type: 'file',
      size: '3.2 MB',
      lastModified: '5 days ago',
      icon: '📈',
      parent: 'q1',
      path: 'documents/projects/2024/reports/q1'
    },
    {
      id: 'file-5',
      name: 'Market Research.docx',
      type: 'file',
      size: '2.1 MB',
      lastModified: '1 week ago',
      icon: '📄',
      parent: 'q1',
      path: 'documents/projects/2024/reports/q1'
    },
    {
      id: 'file-doc-1',
      name: 'Business Plan.txt',
      type: 'file',
      size: '45 KB',
      lastModified: '4 days ago',
      icon: '📝',
      parent: 'q1',
      path: 'documents/projects/2024/reports/q1'
    },
    {
      id: 'file-doc-2',
      name: 'Meeting Notes.csv',
      type: 'file',
      size: '120 KB',
      lastModified: '2 days ago',
      icon: '📊',
      parent: 'q1',
      path: 'documents/projects/2024/reports/q1'
    }
  );

  // Documents/Projects/2024/Presentations files
  files.push(
    {
      id: 'file-6',
      name: 'Company Overview.pptx',
      type: 'file',
      size: '15.3 MB',
      lastModified: '2 weeks ago',
      icon: '📽️',
      parent: 'presentations',
      path: 'documents/projects/2024/presentations'
    },
    {
      id: 'file-7',
      name: 'Product Demo.pptx',
      type: 'file',
      size: '22.1 MB',
      lastModified: '3 weeks ago',
      icon: '📽️',
      parent: 'presentations',
      path: 'documents/projects/2024/presentations'
    }
  );

  // Pictures folder files (main level)
  files.push(
    {
      id: 'file-pic-1',
      name: 'Profile Photo.jpg',
      type: 'file',
      size: '2.3 MB',
      lastModified: '2 days ago',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures'
    },
    {
      id: 'file-pic-2',
      name: 'Desktop Wallpaper.png',
      type: 'file',
      size: '8.1 MB',
      lastModified: '1 week ago',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures'
    },
    {
      id: 'file-pic-3',
      name: 'Screenshot.png',
      type: 'file',
      size: '1.9 MB',
      lastModified: '3 days ago',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures'
    }
  );

  // Pictures/Vacation files
  files.push(
    {
      id: 'file-8',
      name: 'Beach Sunset.jpg',
      type: 'file',
      size: '4.7 MB',
      lastModified: '1 month ago',
      icon: '🖼️',
      parent: 'vacation',
      path: 'pictures/vacation'
    },
    {
      id: 'file-9',
      name: 'Mountain View.jpg',
      type: 'file',
      size: '6.2 MB',
      lastModified: '1 month ago',
      icon: '🖼️',
      parent: 'vacation',
      path: 'pictures/vacation'
    },
    {
      id: 'file-vac-1',
      name: 'Ocean Waves.jpg',
      type: 'file',
      size: '5.8 MB',
      lastModified: '1 month ago',
      icon: '🖼️',
      parent: 'vacation',
      path: 'pictures/vacation'
    },
    {
      id: 'file-vac-2',
      name: 'Tropical Paradise.jpg',
      type: 'file',
      size: '7.2 MB',
      lastModified: '1 month ago',
      icon: '🖼️',
      parent: 'vacation',
      path: 'pictures/vacation'
    },
    {
      id: 'file-vac-3',
      name: 'Island Adventure.jpg',
      type: 'file',
      size: '6.4 MB',
      lastModified: '1 month ago',
      icon: '🖼️',
      parent: 'vacation',
      path: 'pictures/vacation'
    },
    {
      id: 'file-vac-4',
      name: 'City Skyline.jpg',
      type: 'file',
      size: '3.9 MB',
      lastModified: '1 month ago',
      icon: '🖼️',
      parent: 'vacation',
      path: 'pictures/vacation'
    }
  );

  // Pictures/Family files
  files.push(
    {
      id: 'file-fam-1',
      name: 'Family Gathering.jpg',
      type: 'file',
      size: '5.2 MB',
      lastModified: '2 weeks ago',
      icon: '🖼️',
      parent: 'family',
      path: 'pictures/family'
    },
    {
      id: 'file-fam-2',
      name: 'Birthday Party.jpg',
      type: 'file',
      size: '4.8 MB',
      lastModified: '3 weeks ago',
      icon: '🖼️',
      parent: 'family',
      path: 'pictures/family'
    },
    {
      id: 'file-fam-3',
      name: 'Wedding Photos.jpg',
      type: 'file',
      size: '9.1 MB',
      lastModified: '1 month ago',
      icon: '🖼️',
      parent: 'family',
      path: 'pictures/family'
    }
  );

  // Add root level video files
  files.push(
    {
      id: 'file-vid-1',
      name: 'Project Demo.mp4',
      type: 'file',
      size: '125 MB',
      lastModified: '3 days ago',
      icon: '🎥',
      parent: 'root',
      path: ''
    },
    {
      id: 'file-vid-2',
      name: 'Tutorial Video.mov',
      type: 'file',
      size: '89 MB',
      lastModified: '1 week ago',
      icon: '🎥',
      parent: 'root',
      path: ''
    }
  );

  // Add root level music files
  files.push(
    {
      id: 'file-music-1',
      name: 'Background Music.mp3',
      type: 'file',
      size: '8.2 MB',
      lastModified: '5 days ago',
      icon: '🎵',
      parent: 'root',
      path: ''
    },
    {
      id: 'file-music-2',
      name: 'Podcast Episode.wav',
      type: 'file',
      size: '45 MB',
      lastModified: '2 weeks ago',
      icon: '🎵',
      parent: 'root',
      path: ''
    },
    {
      id: 'file-music-3',
      name: 'Piano Recording.flac',
      type: 'file',
      size: '25 MB',
      lastModified: '1 month ago',
      icon: '🎵',
      parent: 'root',
      path: ''
    }
  );

  // Add root level "other" files
  files.push(
    {
      id: 'file-other-1',
      name: 'Software Installer.exe',
      type: 'file',
      size: '156 MB',
      lastModified: '1 week ago',
      icon: '⚙️',
      parent: 'root',
      path: ''
    },
    {
      id: 'file-other-2',
      name: 'Project Archive.zip',
      type: 'file',
      size: '34 MB',
      lastModified: '4 days ago',
      icon: '🗜️',
      parent: 'root',
      path: ''
    },
    {
      id: 'file-other-3',
      name: 'Mobile App.apk',
      type: 'file',
      size: '78 MB',
      lastModified: '2 weeks ago',
      icon: '📱',
      parent: 'root',
      path: ''
    },
    {
      id: 'file-other-4',
      name: 'Config Settings.json',
      type: 'file',
      size: '12 KB',
      lastModified: '3 days ago',
      icon: '⚙️',
      parent: 'root',
      path: ''
    }
  );

  // Video gallery with full metadata
  files.push(
    {
      id: 'video-1',
      name: 'Big Buck Bunny.mp4',
      type: 'file',
      size: '158 MB',
      lastModified: '2023-03-15',
      icon: '🎥',
      parent: 'videos',
      path: 'videos',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself. When one sunny day three rodents rudely harass Bunny\'s two favorite butterflies, Bunny sets aside his peaceful nature and orchestrates a complex plan for revenge.',
      subtitle: 'By Blender Foundation'
    },
    {
      id: 'video-2',
      name: 'Elephant Dream.mp4',
      type: 'file',
      size: '79 MB',
      lastModified: '2023-01-10',
      icon: '🎥',
      parent: 'videos',
      path: 'videos',
      thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=200&fit=crop',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      description: 'The first Blender Open Movie from 2006. Elephant\'s Dream is a story about a young man and an older man. The relationships between the two protagonists are unclear, and their destinies are on a collision course.',
      subtitle: 'By Blender Foundation'
    },
    {
      id: 'video-3',
      name: 'For Bigger Blazes.mp4',
      type: 'file',
      size: '15 MB',
      lastModified: '2023-05-22',
      icon: '🎥',
      parent: 'videos',
      path: 'videos',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      description: 'HBO GO now works with Chromecast. Introducing HBO GO on Chromecast: the easiest way to enjoy HBO\'s award-winning series, documentaries, movies, and more on your TV.',
      subtitle: 'By Google'
    },
    {
      id: 'video-4',
      name: 'Sintel.mp4',
      type: 'file',
      size: '74 MB',
      lastModified: '2023-02-18',
      icon: '🎥',
      parent: 'videos',
      path: 'videos',
      thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=200&fit=crop',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      description: 'Sintel is an independently produced short film, initiated by the Blender Foundation as a means to further improve and validate the free/open source 3D creation suite Blender.',
      subtitle: 'By Blender Foundation'
    },
    {
      id: 'video-5',
      name: 'Tears of Steel.mp4',
      type: 'file',
      size: '46 MB',
      lastModified: '2023-04-05',
      icon: '🎥',
      parent: 'videos',
      path: 'videos',
      thumbnail: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      description: 'Tears of Steel was realized with crowd-funding by users of the open source 3D creation tool Blender. Target was to improve and test a complete open and free pipeline for visual effects in film.',
      subtitle: 'By Blender Foundation'
    },
    {
      id: 'video-6',
      name: 'Subaru Outback On Street And Dirt.mp4',
      type: 'file',
      size: '124 MB',
      lastModified: '2023-06-12',
      icon: '🎥',
      parent: 'videos',
      path: 'videos',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      description: 'Smoking Tire takes the all-new Subaru Outback to the highest point we can find in hopes our customer-developed commercial plays something other than elevator music.',
      subtitle: 'By Subaru'
    }
  );

  // Add more music in music folder
  files.push(
    {
      id: 'file-music-4',
      name: 'Album Track 01.mp3',
      type: 'file',
      size: '6.8 MB',
      lastModified: '1 week ago',
      icon: '🎵',
      parent: 'music',
      path: 'music'
    },
    {
      id: 'file-music-5',
      name: 'Nature Sounds.ogg',
      type: 'file',
      size: '12 MB',
      lastModified: '5 days ago',
      icon: '🎵',
      parent: 'music',
      path: 'music'
    },
    {
      id: 'file-music-6',
      name: 'Voice Memo.aac',
      type: 'file',
      size: '3.2 MB',
      lastModified: '2 days ago',
      icon: '🎵',
      parent: 'music',
      path: 'music'
    }
  );

  // Add more documents in documents folder
  files.push(
    {
      id: 'file-doc-3',
      name: 'Annual Report.pdf',
      type: 'file',
      size: '8.5 MB',
      lastModified: '1 week ago',
      icon: '📄',
      parent: 'documents',
      path: 'documents'
    },
    {
      id: 'file-doc-4',
      name: 'Budget Spreadsheet.xls',
      type: 'file',
      size: '2.1 MB',
      lastModified: '3 days ago',
      icon: '📊',
      parent: 'documents',
      path: 'documents'
    },
    {
      id: 'file-doc-5',
      name: 'Team Presentation.ppt',
      type: 'file',
      size: '15 MB',
      lastModified: '5 days ago',
      icon: '📽️',
      parent: 'documents',
      path: 'documents'
    }
  );

  // Dragon Ball Super image collection
  files.push(
    {
      id: 'dbs-img-1',
      name: 'Dragon Ball Super Poster.jpg',
      type: 'file',
      size: '1.2 MB',
      lastModified: '2023-05-10',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures',
      thumbnail: 'https://m.media-amazon.com/images/S/pv-target-images/0eed584f7827064d74d4e892a66d827b7293c131f3aeb2046e7ed59ddd17b562._SX1080_FMjpg_.jpg'
    },
    {
      id: 'dbs-img-2',
      name: 'DBS Character Art.jpg',
      type: 'file',
      size: '650 KB',
      lastModified: '2022-11-20',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures',
      thumbnail: 'https://static.wikia.nocookie.net/polski-dubbing/images/2/2a/Dragon_Ball_Super.jpg/revision/latest?cb=20181012082258&path-prefix=pl'
    },
    {
      id: 'dbs-img-3',
      name: 'Super Saiyan Blue.jpg',
      type: 'file',
      size: '900 KB',
      lastModified: '2021-05-15',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures',
      thumbnail: 'https://pananimacja.pl/wp-content/uploads/2021/05/dragon-ball-super-1.jpg'
    },
    {
      id: 'dbs-img-4',
      name: 'Tournament Power.jpg',
      type: 'file',
      size: '1.1 MB',
      lastModified: '2022-03-10',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures',
      thumbnail: 'https://i.ytimg.com/vi/dHtXpETZGSo/maxresdefault.jpg'
    },
    {
      id: 'dbs-img-5',
      name: 'Goku vs Jiren.jpg',
      type: 'file',
      size: '750 KB',
      lastModified: '2023-07-22',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures',
      thumbnail: 'https://m.media-amazon.com/images/M/MV5BNmZjYWI2MWQtYmJiZC00MTkwLWIwNGQtNTRjYzRmNmYyZjA5XkEyXkFqcGc@._V1_.jpg'
    },
    {
      id: 'dbs-img-6',
      name: 'New Episodes.jpg',
      type: 'file',
      size: '1.0 MB',
      lastModified: '2022-07-15',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures',
      thumbnail: 'https://static.android.com.pl/uploads/2022/07/dragon-ball-super-nowe-odcinki.jpg'
    },
    {
      id: 'dbs-img-7',
      name: 'Anime Wallpaper.png',
      type: 'file',
      size: '850 KB',
      lastModified: '2018-01-20',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures',
      thumbnail: 'https://skomplikowane.pl/wp-content/uploads/2018/01/Dragon-Ball-Super-e1516697095300.png'
    },
    {
      id: 'dbs-img-8',
      name: 'Ultra Instinct.jpg',
      type: 'file',
      size: '950 KB',
      lastModified: '2022-06-18',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures',
      thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzQBKiVyfPwPfPCrRVDtrVmQw7D-yFGs4fbA&s'
    },
    {
      id: 'dbs-img-9',
      name: 'Epic Battle Scene.jpg',
      type: 'file',
      size: '1.3 MB',
      lastModified: '2023-11-11',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures',
      thumbnail: 'https://external-preview.redd.it/RSYLyODh7erDHadQFDnOUMPQXs09aHfhwamXIMAXY9g.jpg?width=640&crop=smart&auto=webp&s=167442a0c6e876240c8b294fe1c690804bd2f01e'
    }
  );

  // Add more images in different formats
  files.push(
    {
      id: 'file-pic-4',
      name: 'Logo Design.gif',
      type: 'file',
      size: '1.2 MB',
      lastModified: '1 week ago',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures'
    },
    {
      id: 'file-pic-5',
      name: 'Banner Image.webp',
      type: 'file',
      size: '890 KB',
      lastModified: '4 days ago',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures'
    },
    {
      id: 'file-pic-6',
      name: 'Icon Set.bmp',
      type: 'file',
      size: '3.4 MB',
      lastModified: '2 weeks ago',
      icon: '🖼️',
      parent: 'pictures',
      path: 'pictures'
    }
  );

  return files;
};

const mockFolders: Folder[] = createNestedFolders();
const mockFiles: FileItem[] = generateNestedFiles();

export const FileManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [files] = useState<FileItem[]>(mockFiles);
  const [folders] = useState<Folder[]>(mockFolders);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [deleteItems, setDeleteItems] = useState<FileItem[]>([]);
  const [modals, setModals] = useState({
    createFolder: false,
    upload: false,
    preview: false,
    rename: false,
    delete: false
  });

  // Pagination state
  const [displayedFiles, setDisplayedFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 20;

  // Initialize state from URL
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/folder/')) {
      const pathSegments = pathname.replace('/folder/', '').split('/').filter(Boolean);
      setCurrentPath(pathSegments);
      
      // Find the folder that matches this path
      const targetPath = pathSegments.join('/');
      const targetFolder = folders.find(f => f.path === targetPath);
      if (targetFolder) {
        setCurrentFolder(targetFolder.id);
      } else if (pathSegments.length === 0) {
        setCurrentFolder('root');
        setCurrentPath([]);
      }
    } else {
      setCurrentFolder('root');
      setCurrentPath([]);
    }
  }, [location.pathname, folders]);

  const openModal = (modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  };

  const closeModal = (modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  const navigateToFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setCurrentFolder(folderId);
      if (folderId === 'root') {
        setCurrentPath([]);
        navigate('/');
      } else {
        const pathSegments = folder.path.split('/').filter(Boolean);
        setCurrentPath(pathSegments);
        navigate(`/folder/${folder.path}`);
      }
    }
  };

  const navigateToPath = (pathArray: string[]) => {
    const targetPath = pathArray.join('/');
    const targetFolder = folders.find(f => f.path === targetPath);
    
    if (targetFolder) {
      setCurrentFolder(targetFolder.id);
      setCurrentPath(pathArray);
      navigate(pathArray.length === 0 ? '/' : `/folder/${targetPath}`);
    } else {
      // Fallback to root
      setCurrentFolder('root');
      setCurrentPath([]);
      navigate('/');
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs: { id: string; name: string; path: string[] }[] = [];
    
    for (let i = 0; i <= currentPath.length; i++) {
      const pathSegments = currentPath.slice(0, i);
      const pathString = pathSegments.join('/');
      
      if (i === 0) {
        // Root
        breadcrumbs.push({
          id: 'root',
          name: 'My Drive',
          path: []
        });
      } else {
        const folder = folders.find(f => f.path === pathString);
        if (folder) {
          breadcrumbs.push({
            id: folder.id,
            name: folder.name,
            path: pathSegments
          });
        }
      }
    }
    
    return breadcrumbs;
  };

  const handleSetCurrentFilter = (filter: string) => {
    setCurrentFilter(filter);
  };

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  // Helper function to get filtered files
  const getFilteredFiles = () => {
    return files.filter(file => {
      const matchesFolder = file.parent === currentFolder;
      const matchesSearch = searchQuery === '' || 
        file.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply type filter
      let matchesFilter = true;
      if (currentFilter !== 'all') {
        // Hide folders for all categories except "all"
        if (file.type === 'folder') {
          return false;
        }
        
        const getFileType = (file: FileItem) => {
          const extension = file.name.split('.').pop()?.toLowerCase();
          
          // Pictures/Images
          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico'].includes(extension || '')) {
            return 'pictures';
          }
          
          // Videos
          if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', '3gp'].includes(extension || '')) {
            return 'videos';
          }
          
          // Documents
          if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'odp', 'ods'].includes(extension || '')) {
            return 'documents';
          }
          
          // Music/Audio
          if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(extension || '')) {
            return 'music';
          }
          
          // Everything else goes to "other"
          return 'other';
        };
        
        const fileType = getFileType(file);
        matchesFilter = fileType === currentFilter;
      }
      
      return matchesFolder && matchesSearch && matchesFilter;
    });
  };

  // Load more files function
  const loadMoreFiles = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const filteredFiles = getFilteredFiles();
    const nextPage = currentPage + 1;
    const newFiles = filteredFiles.slice(0, (nextPage + 1) * PAGE_SIZE);
    
    setDisplayedFiles(newFiles);
    setCurrentPage(nextPage);
    setHasMore(newFiles.length < filteredFiles.length);
    setIsLoading(false);
  };

  // Reset pagination function
  const resetPagination = () => {
    const filteredFiles = getFilteredFiles();
    const initialFiles = filteredFiles.slice(0, PAGE_SIZE);
    
    setDisplayedFiles(initialFiles);
    setCurrentPage(0);
    setHasMore(initialFiles.length < filteredFiles.length);
    setIsLoading(false);
  };

  // Initialize pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [currentFolder, currentFilter, searchQuery]);

  // Simulate API search functionality
  const searchFiles = async (query: string): Promise<FileItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return files.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <FileManagerContext.Provider value={{
      files,
      folders,
      currentFolder,
      currentPath,
      viewMode,
      selectedItems,
      searchQuery,
      currentFilter,
      modals,
      previewFile,
      renameItem,
      deleteItems,
      // Pagination
      displayedFiles,
      isLoading,
      hasMore,
      loadMoreFiles,
      resetPagination,
      // Methods
      setCurrentFolder: navigateToFolder,
      setViewMode,
      setSelectedItems,
      setSearchQuery: handleSetSearchQuery,
      setCurrentFilter: handleSetCurrentFilter,
      openModal,
      closeModal,
      setPreviewFile,
      setRenameItem,
      setDeleteItems,
      searchFiles,
      navigateToFolder,
      navigateToPath,
      getBreadcrumbs
    }}>
      {children}
    </FileManagerContext.Provider>
  );
};

export const useFileManager = () => {
  const context = useContext(FileManagerContext);
  if (context === undefined) {
    throw new Error('useFileManager must be used within a FileManagerProvider');
  }
  return context;
};
