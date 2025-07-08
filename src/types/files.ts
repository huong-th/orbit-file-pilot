/* ------------------------------------------------------------------ */
/*  Common enums & aliases                                             */
/* ------------------------------------------------------------------ */
export type FileCategory = 'picture' | 'document' | 'video' | 'audio' | 'other' | 'all';

/* ------------------------------------------------------------------ */
/*  Core entities                                                      */
/* ------------------------------------------------------------------ */
/**
 * File stored in cloud (S3/MinIO). Distinct from DOM `File`.
 */
export interface RemoteFile {
  id: string;
  user_id?: string;
  parent_id?: string;
  object_key: string;
  name: string;
  size: number;
  mime_type: string;
  category: FileCategory;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  thumbnailUrlExp?: string; // ISO timestamp
  is_starred: boolean;
  is_shared_public: boolean;
  shared_to?: any[];
  expiresAt?: string | null; // ISO timestamp
  createdAt: string; // ISO
  updatedAt: string; // ISO
  deletedAt?: string | null; // ISO
  kind: 'file';
}

/**
 * Folder node in My‑Drive
 */
export interface RemoteFolder {
  id: string;
  user_id?: string;
  parent_id?: string | null;
  name: string;
  deletedAt?: string | null; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
  /** full path string array, optional helper for breadcrumbs */
  path?: string[];
  kind: 'folder';
}

/** Drive item = file or folder */
export type DriveItem = RemoteFile | RemoteFolder;

/* ------------------------------------------------------------------ */
/*  UI / helper models                                                */
/* ------------------------------------------------------------------ */
export interface Breadcrumb {
  id: string;
  name: string;
  /** path segments, e.g. ['documents','projects'] */
  path: string[];
}

export interface FileQueryParams {
  category?: FileCategory;
  starred?: boolean;
  shared?: boolean;
  deleted?: boolean;
  q?: string;
  sort?: 'name' | 'updated' | 'size';
  order?: 'asc' | 'desc';
  limit?: number;
  cursor?: string;
}

/* ------------------------------------------------------------------ */
/*  API response shapes                                               */
/* ------------------------------------------------------------------ */
export interface FolderContentsResponse {
  items: DriveItem[];
  nextCursor?: string;
}

export interface FlatFilesResponse {
  files: RemoteFile[];
  nextCursor?: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

// Dashboard summary response
export interface NewUploadsThisMonth {
  totalFolders: number;
  totalImages: number;
  totalVideos: number;
  totalDocuments: number;
  totalMusic: number;
  totalOthers: number;
}

export interface SummaryData {
  totalFolders: number;
  totalImages: number;
  totalVideos: number;
  totalDocuments: number;
  totalMusic: number;
  totalOthers: number;
  storageUsed: number;
  storageTotal: number;
  newUploadsThisMonth: NewUploadsThisMonth;
}

export interface TrendPoint {
  name: string;         // 'Mon', 'Jan', ...
  images: number;
  videos: number;
  documents: number;
  musics: number;
  others: number;
}

export interface FileTypeDistributionItem {
  name: string;        // e.g. 'Picture'
  value: number;
  percentage: number;
  size: string;        // e.g. '0.1 GB'
  category: string;    // 'picture' | 'video' | ...
  color: string;
}

export interface RecentFile {
  id: string;
  createdAt: string;
  updatedAt: string;
  objectKey: string;
  name: string;
  size: string;
  mimeType: string;
  category: string;
  parent: {
    id: string;
    name: string;
  } | null;
  // phần còn lại nếu bạn cần
}
