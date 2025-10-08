import { generateFileName } from './file-name-generator';
import { FileResult } from '@/types';

/**
 * Downloads a single compressed file
 * @param blob - The compressed file blob
 * @param originalFileName - The original filename
 * @param suffix - The suffix to add to the filename (default: 'compressed')
 */
export function downloadSingleFile(blob: Blob, originalFileName: string, suffix = 'compressed'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = generateFileName(originalFileName, suffix);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads multiple compressed files
 * @param fileResults - Array of completed file results with blobs
 * @param suffix - The suffix to add to filenames (default: 'compressed')
 */
export function downloadMultipleFiles(fileResults: FileResult[], suffix = 'compressed'): void {
  fileResults.forEach(fileResult => {
    if (fileResult.compressedBlob) {
      downloadSingleFile(fileResult.compressedBlob, fileResult.originalFile.name, suffix);
    }
  });
}

/**
 * Filters file results to get only completed files with blobs
 * @param fileResults - Array of all file results
 * @returns Array of completed files ready for download
 */
export function getDownloadableFiles(fileResults: FileResult[]): FileResult[] {
  return fileResults.filter(f => f.status === 'completed' && f.compressedBlob);
}