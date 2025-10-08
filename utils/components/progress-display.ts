/**
 * Utility functions for ProgressDisplay component
 */

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

export const calculateAverageCompressionRatio = (
  compressionStats: Array<{ compressionRatio: number }>
): number => {
  if (compressionStats.length === 0) return 0;
  
  const total = compressionStats.reduce((sum, stat) => sum + stat.compressionRatio, 0);
  return total / compressionStats.length;
};

export const calculateTotalSizes = (
  compressionStats: Array<{ originalSize: number; compressedSize: number }>
): { totalOriginalSize: number; totalCompressedSize: number } => {
  const totalOriginalSize = compressionStats.reduce((sum, stat) => sum + stat.originalSize, 0);
  const totalCompressedSize = compressionStats.reduce((sum, stat) => sum + stat.compressedSize, 0);
  
  return { totalOriginalSize, totalCompressedSize };
};