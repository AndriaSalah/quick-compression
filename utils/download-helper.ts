import { generateFileName } from './file-name-generator';
import { FileResult } from '@/types';

/**
 * Downloads a single compressed file
 * @param blob - The compressed file blob
 * @param originalFileName - The original filename
 * @param suffix - The suffix to add to the filename (default: 'compressed')
 * @param outputFormat - Optional output format override
 */
export function downloadSingleFile(
  blob: Blob, 
  originalFileName: string, 
  suffix = 'compressed',
  outputFormat?: string
): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Determine output format from blob MIME type if not provided
  console.log('Blob MIME type:', blob.type);
  const detectedFormat = outputFormat || detectFormatFromMimeType(blob.type);
  
  a.download = generateFileName(originalFileName, suffix, detectedFormat);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Detects output format from MIME type
 * @param mimeType - The blob's MIME type
 * @returns The detected format or undefined
 */
function detectFormatFromMimeType(mimeType: string): string | undefined {
  switch (mimeType) {
    // Audio
    case 'audio/mp3':
    case 'audio/mpeg': return 'mp3';
    case 'audio/ogg': return 'ogg';
    case 'audio/wav': return 'wav';
    case 'audio/aac': return 'aac';
    case 'audio/x-m4a': return 'm4a';
    case 'audio/flac': return 'flac';
    
    // Video
    case 'video/mp4': return 'mp4';
    case 'video/webm': return 'webm';
    case 'video/x-matroska': return 'mkv';
    case 'video/x-msvideo': return 'avi';
    case 'video/quicktime': return 'mov';
    
    // Image
    case 'image/jpeg': return 'jpeg';
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    case 'image/avif': return 'avif';
    case 'image/bmp': return 'bmp';
    case 'image/tiff': return 'tiff';
    
    // PDF
    case 'application/pdf': return 'pdf';
    
    default: return undefined;
  }
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