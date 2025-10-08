/**
 * Utility functions for FileDropZone component
 */

export const getFileTypeIcon = (file: File): string => {
  const type = file.type;
  
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎥';
  if (type.startsWith('audio/')) return '🎵';
  return '📄';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isFileTypeSupported = (file: File): boolean => {
  const supportedTypes = [
    'image/', 'video/', 'audio/'
  ];
  
  return supportedTypes.some(type => file.type.startsWith(type));
};

export const validateFileSize = (file: File, maxSizeInMB: number = 100): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const groupFilesByType = (files: File[]): {
  images: File[];
  videos: File[];
  audio: File[];
  others: File[];
} => {
  return files.reduce((acc, file) => {
    if (file.type.startsWith('image/')) {
      acc.images.push(file);
    } else if (file.type.startsWith('video/')) {
      acc.videos.push(file);
    } else if (file.type.startsWith('audio/')) {
      acc.audio.push(file);
    } else {
      acc.others.push(file);
    }
    return acc;
  }, { images: [], videos: [], audio: [], others: [] } as {
    images: File[];
    videos: File[];
    audio: File[];
    others: File[];
  });
};