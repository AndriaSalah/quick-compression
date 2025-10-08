/**
 * Utility functions for FileListResults component
 */

import { File, Image, Video, Music } from 'lucide-react';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (file: File) => {
  const type = file.type;
  
  if (type.startsWith('image/')) {
    return <Image className="w-5 h-5 text-blue-500" />;
  } else if (type.startsWith('video/')) {
    return <Video className="w-5 h-5 text-green-500" />;
  } else if (type.startsWith('audio/')) {
    return <Music className="w-5 h-5 text-purple-500" />;
  } else {
    return <File className="w-5 h-5 text-gray-500" />;
  }
};

export const generateFileName = (originalName: string, suffix: string = 'compressed'): string => {
  const lastDotIndex = originalName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${originalName}_${suffix}`;
  }
  
  const nameWithoutExt = originalName.substring(0, lastDotIndex);
  const extension = originalName.substring(lastDotIndex);
  return `${nameWithoutExt}_${suffix}${extension}`;
};

export const filterFilesByStatus = <T extends { status: string }>(
  files: T[], 
  status: string
): T[] => {
  return files.filter(f => f.status === status);
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};