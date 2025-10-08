/**
 * Common types and interfaces used across the application
 */

export interface CompressionOptions {
  // Common options
  outputFormat?: string;
  customArgs?: string[];
  
  // Audio options
  bitrate?: string;
  sampleRate?: string;
  channels?: number;
  acodec?: string;
  
  // Video options
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  preset?: string;
  crf?: number;
  scale?: string;
  vcodec?: string;
  
  // Image options
  imageQuality?: number;
  
  // PDF options
  pdfQuality?: 'screen' | 'ebook' | 'printer' | 'prepress' | 'default';
  pdfCompatibility?: '1.4' | '1.5' | '1.6' | '1.7';
  grayscale?: boolean;
  optimizeImages?: boolean;
  linearize?: boolean;
  removeMetadata?: boolean;
}

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  timestamp: number;
}

export interface FileResult {
  id: string;
  originalFile: File;
  compressedBlob?: Blob;
  status: 'pending' | 'compressing' | 'completed' | 'error';
  error?: string;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number;
  timestamp?: number;
}

export type FileStatus = 'pending' | 'compressing' | 'completed' | 'error';

export interface ProgressDisplayProps {
  isCompressing: boolean;
  compressionProgress: number | null;
  compressionStats: CompressionStats[];
  error: string | null;
  currentFile?: string;
  isFFmpegLoaded: boolean;
  isFFmpegLoading?: boolean;
}

export interface FileListResultsProps {
  files: FileResult[];
  onRemoveFile: (id: string) => void;
  onRetryFile: (id: string) => void;
  onCompressFile: (id: string) => void;
  onDownloadFile: (id: string) => void;
  onDownloadAll: () => void;
  onCompressAll: () => void;
  onClearAll: () => void;
  isProcessing: boolean;
  isFFmpegLoaded: boolean;
}

export interface CompressionSettingsProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
  selectedFiles: File[];
}

export interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  isProcessing: boolean;
}