export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  timestamp: number;
}

export interface ProgressDisplayProps {
  isCompressing: boolean;
  compressionProgress: number | null;
  compressionStats: CompressionStats[];
  error: string | null;
  currentFile?: string;
  isFFmpegLoaded: boolean;
  isFFmpegLoading?: boolean;
}

export interface FFmpegLoaderProps {
  isFFmpegLoaded: boolean;
  isFFmpegLoading: boolean;
  error: string | null;
  isCompressing: boolean;
}

export interface CurrentCompressionProgressProps {
  isCompressing: boolean;
  compressionProgress: number | null;
  currentFile?: string;
}

export interface CompressionHistoryProps {
  compressionStats: CompressionStats[];
}