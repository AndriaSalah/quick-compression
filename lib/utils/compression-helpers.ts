/**
 * Compression helper utilities
 * Provides file size formatting and compression statistics
 */

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  timestamp: number;
}

/**
 * Formats file size in MB with appropriate precision
 */
export const formatFileSizeMB = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${mb.toFixed(2)} MB`;
};

/**
 * Formats file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Calculates compression statistics
 */
export const calculateCompressionStats = (
  originalSize: number,
  compressedSize: number
): CompressionStats => {
  const compressionRatio = originalSize > 0 
    ? ((originalSize - compressedSize) / originalSize) * 100 
    : 0;
  
  return {
    originalSize,
    compressedSize,
    compressionRatio,
    timestamp: Date.now()
  };
};

/**
 * Gets file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Determines if a file is an audio file
 */
export const isAudioFile = (filename: string): boolean => {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'];
  return audioExtensions.includes(getFileExtension(filename));
};

/**
 * Determines if a file is a video file
 */
export const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['mp4', 'avi', 'mkv', 'webm', 'mov', 'wmv', 'flv', '3gp'];
  return videoExtensions.includes(getFileExtension(filename));
};

/**
 * Determines if a file is an image file
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'avif'];
  return imageExtensions.includes(getFileExtension(filename));
};

/**
 * Determines if a file is a PDF file
 */
export const isPdfFile = (filename: string): boolean => {
  return getFileExtension(filename) === 'pdf';
};