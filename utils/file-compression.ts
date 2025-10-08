import { formatFileSize } from './file-size-formatter';
import { CompressionOptions } from '@/types';

interface CompressionResult {
  compressedBlob: Blob;
  compressionRatio: number;
  originalSize: number;
  compressedSize: number;
}

/**
 * Calculates compression ratio as a percentage
 * @param originalSize - Original file size in bytes
 * @param compressedSize - Compressed file size in bytes
 * @returns Compression ratio as percentage (e.g., 65.2 for 65.2% reduction)
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * Determines the appropriate compression method based on file type
 * @param file - The file to be compressed
 * @returns The compression type: 'image', 'video', 'audio', 'pdf', or null if unsupported
 */
export function getCompressionType(file: File): 'image' | 'video' | 'audio' | 'pdf' | null {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('video/')) {
    return 'video';
  } else if (file.type.startsWith('audio/')) {
    return 'audio';
  } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return 'pdf';
  }
  return null;
}

/**
 * Formats compression success message with file size details
 * @param fileName - Name of the compressed file
 * @param originalSize - Original file size in bytes
 * @param compressedSize - Compressed file size in bytes
 * @returns Formatted success message object
 */
export function formatCompressionSuccess(fileName: string, originalSize: number, compressedSize: number) {
  const compressionRatio = calculateCompressionRatio(originalSize, compressedSize);
  
  return {
    title: `Successfully compressed ${fileName}`,
    description: `Reduced by ${compressionRatio.toFixed(1)}% (${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)})`
  };
}

/**
 * Processes compression result and returns formatted data
 * @param file - Original file
 * @param compressedBlob - Compressed file blob
 * @returns Compression result with calculated metrics
 */
export function processCompressionResult(file: File, compressedBlob: Blob): CompressionResult {
  const compressionRatio = calculateCompressionRatio(file.size, compressedBlob.size);
  
  return {
    compressedBlob,
    compressionRatio,
    originalSize: file.size,
    compressedSize: compressedBlob.size
  };
}