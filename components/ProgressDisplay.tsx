"use client";

import { ProgressDisplayProps } from '@/types/progress';
import { FFmpegLoader } from '@/components/progress/FFmpegLoader';
import { CurrentCompressionProgress } from '@/components/progress/CurrentCompressionProgress';
import { CompressionHistory } from '@/components/progress/CompressionHistory';

export function ProgressDisplay({ 
  isCompressing, 
  compressionProgress, 
  compressionStats, 
  error, 
  currentFile,
  isFFmpegLoaded,
  isFFmpegLoading = false
}: ProgressDisplayProps) {
  return (
    <div className="space-y-4">
      <FFmpegLoader 
        isFFmpegLoaded={isFFmpegLoaded}
        isFFmpegLoading={isFFmpegLoading}
        error={error}
        isCompressing={isCompressing}
      />
      
      <CurrentCompressionProgress 
        isCompressing={isCompressing}
        compressionProgress={compressionProgress}
        currentFile={currentFile}
      />
      
      <CompressionHistory 
        compressionStats={compressionStats}
      />
    </div>
  );
}