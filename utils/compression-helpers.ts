/**
 * Helper functions for compression operations
 */

/**
 * Formats file size in bytes to human-readable MB format
 * @param bytes - The file size in bytes
 * @returns Formatted file size string (e.g., "1.50MB")
 */
export function formatFileSizeMB(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)}MB`;
}

/**
 * Extracts file extension from filename
 * @param filename - The filename to extract extension from
 * @returns The file extension in lowercase (e.g., "mp4", "jpg")
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || 'bin';
}

/**
 * Determines the media type based on file extension
 * @param file - The file to check
 * @returns The media type ('audio', 'video', 'image', 'pdf', 'unknown')
 */
export function getMediaType(file: File): string {
  const extension = getFileExtension(file.name);
  
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];
  const videoExtensions = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'wmv', 'flv'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const pdfExtensions = ['pdf'];
  
  if (audioExtensions.includes(extension)) return 'audio';
  if (videoExtensions.includes(extension)) return 'video';
  if (imageExtensions.includes(extension)) return 'image';
  if (pdfExtensions.includes(extension)) return 'pdf';
  
  return 'unknown';
}

/**
 * Calculates new dimensions while maintaining aspect ratio
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum allowed width
 * @param maxHeight - Maximum allowed height
 * @returns New dimensions object with width and height
 */
export function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
}

/**
 * Calculates compression statistics
 * @param originalSize - Original file size in bytes
 * @param compressedSize - Compressed file size in bytes
 * @returns Compression statistics object
 */
export function calculateCompressionStats(originalSize: number, compressedSize: number) {
  const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
  return {
    originalSize,
    compressedSize,
    compressionRatio,
    timestamp: Date.now()
  };
}