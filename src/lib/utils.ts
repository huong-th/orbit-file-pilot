import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileCategory } from '@/types/files.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/*  categoryKey: chuẩn hoá giá trị category từ API → khóa ngắn gọn    */
/* ------------------------------------------------------------------ */
const catMap: Record<FileCategory, string> = {
  picture: 'images',
  document: 'documents',
  video: 'videos',
  audio: 'music',
  other: 'other',
  all: 'all',
};

/**
 * Trả về khóa ngắn gọn (images, videos, …) dùng cho flat-list.
 * Bất kỳ giá trị lạ → 'all'.
 */
export const categoryKey = (category?: string | null): string => {
  const key = (category ?? 'all').toLowerCase() as FileCategory;
  return catMap[key] ?? 'all';
};

/* ------------------------------------------------------------------ */
/*  buildPaginationKey: sinh khóa cache/phân trang duy nhất           */
/* ------------------------------------------------------------------ */
/**
 * folderId = 'root' hoặc uuid, filter = 'all' | 'images' | …
 * • Nếu filter khác 'all'   →  flat-images
 * • Nếu filter === 'all'    →  folder-<folderId>
 */
export const buildPaginationKey = (folderId: string, filter: string): string =>
  filter && filter !== 'all' ? `flat-${filter}` : `folder-${folderId}`;

/* ------------------------------------------------------------------ */
/*  mergeUnique: tiện ích hợp nhất ID, giữ thứ tự                      */
/* ------------------------------------------------------------------ */
export const mergeUnique = (prev: string[] = [], incoming: string[]) => {
  const set = new Set(prev);
  incoming.forEach((id) => set.add(id));
  return Array.from(set);
};

export function convertAndFindLargestUnit(bits: number): string {
  const units: string[] = ['bits', 'KB', 'MB', 'GB', 'TB']; // Units from smallest to largest
  let value: number = bits;
  let unitIndex: number = 0;

  // Check each unit, dividing by 1024 until the value is less than 1024 or we run out of units
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`; // Return the value with 2 decimal places and the unit
}

/**
 * Lấy giá trị tham số từ URL
 * @param {string} paramName - Tên tham số cần lấy
 * @param {string} [url] - URL nguồn (tuỳ chọn). Nếu không truyền sẽ lấy URL hiện tại.
 * @returns {string|null} Giá trị tham số hoặc null nếu không tồn tại
 */
export function getQueryParam(paramName: string, url?: string): string {
  let searchParams;

  if (url) {
    const parsedUrl = new URL(url);
    searchParams = parsedUrl.searchParams;
  } else {
    searchParams = new URLSearchParams(window.location.search);
  }

  return searchParams.get(paramName);
}
