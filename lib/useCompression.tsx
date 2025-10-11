"use client"

import { useState, useCallback } from 'react';
import { CompressionOptions, CompressionStats } from '@/types';
import { useFFmpeg } from './useFFmpeg';
import { useAudioCompression } from './useAudioCompression';
import { useVideoCompression } from './useVideoCompression';
import { useImageCompression } from './useImageCompression';
import { usePdfCompression } from './usePdfCompression';
import { CompressionQueue, getOptimalThreadConfig, getThreadConfigInfo } from './threadUtils';
import { useCompressionStore } from '@/store/compression-store';

export const useCompression = () => {
  // Use FFmpeg hook for state management
  const {
    isFFmpegLoaded,
    isFFmpegLoading,
    error,
    compressionProgress,
    manualInitialize,
    clearError
  } = useFFmpeg();

  const {audioOptions, videoOptions, imageOptions, pdfOptions} = useCompressionStore()

  // Threading and queue state
  const [compressionQueue] = useState(() => new CompressionQueue());
  const [threadConfig] = useState(() => getOptimalThreadConfig());

  // Specialized compression hooks
  const { compressAudio } = useAudioCompression();
  const { compressVideo } = useVideoCompression();
  const { compressImage } = useImageCompression();
  const { compressPdf } = usePdfCompression();

  // UI state
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionStats[]>([]);
  const [queueStatus, setQueueStatus] = useState({ queued: 0, running: 0, maxConcurrent: 0 });
  const [batchProgress, setBatchProgress] = useState<{ completed: number; total: number } | null>(null);

  // Wrapper functions that handle common state management
  const handleAudioCompression = async (file: File): Promise<Blob> => {
    setIsCompressing(true);
    try {
      const result = await compressAudio(file);
      // Note: stats are already logged in the specialized hook
      return result;
    } finally {
      setIsCompressing(false);
    }
  };

  const handleVideoCompression = async (file: File): Promise<Blob> => {
    setIsCompressing(true);
    try {
      const result = await compressVideo(file);
      // Note: stats are already logged in the specialized hook
      return result;
    } finally {
      setIsCompressing(false);
    }
  };

  const handleImageCompression = async (file: File): Promise<Blob> => {
    setIsCompressing(true);
    try {
      const result = await compressImage(file);
      // Note: stats are already logged in the specialized hook
      return result;
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePdfCompression = async (file: File, customOptions: CompressionOptions = {}): Promise<Blob> => {
    setIsCompressing(true);
    try {
      const result = await compressPdf(file);
      // Note: stats are already logged in the specialized hook
      return result;
    } finally {
      setIsCompressing(false);
    }
  };

  // Update queue status periodically
  const updateQueueStatus = useCallback(() => {
    const status = compressionQueue.getStatus();
    setQueueStatus(status);
  }, [compressionQueue]);

  // Batch compression with queue management
  const compressBatch = useCallback(async (
    files: File[],
    customOptions: CompressionOptions = {}
  ): Promise<{ file: File; result: Blob | null; error: string | null }[]> => {
    setBatchProgress({ completed: 0, total: files.length });
    const results: { file: File; result: Blob | null; error: string | null }[] = [];
    let completed = 0;

    console.log(`Starting batch compression of ${files.length} files`);
    console.log('Thread config:', getThreadConfigInfo());

    const compressionPromises = files.map(async (file) => {
      try {
        const result = await compressionQueue.add(async () => {
          // Determine compression type based on file
          const fileName = file.name.toLowerCase();
          
          if (fileName.match(/\.(mp3|wav|ogg|aac|m4a|flac|wma)$/)) {
            return await compressAudio(file);
          } else if (fileName.match(/\.(mp4|avi|mkv|webm|mov|wmv|flv|3gp)$/)) {
            return await compressVideo(file);
          } else if (fileName.match(/\.(jpg|jpeg|png|webp|gif|bmp|tiff|avif)$/)) {
            return await compressImage(file);
          } else if (fileName.match(/\.pdf$/)) {
            return await compressPdf(file);
          } else {
            throw new Error(`Unsupported file type: ${file.name}`);
          }
        });

        completed++;
        setBatchProgress({ completed, total: files.length });
        updateQueueStatus();

        return { file, result, error: null };
      } catch (error) {
        completed++;
        setBatchProgress({ completed, total: files.length });
        updateQueueStatus();

        return { 
          file, 
          result: null, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    const batchResults = await Promise.allSettled(compressionPromises);
    
    // Process results
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({ 
          file: files[results.length], 
          result: null, 
          error: result.reason?.message || 'Batch processing failed' 
        });
      }
    });

    setBatchProgress(null);
    console.log(`Batch compression complete: ${results.length} files processed`);
    
    return results;
  }, [compressAudio, compressVideo, compressImage, compressPdf, compressionQueue, updateQueueStatus]);

  // Quick batch compression for specific types
  const compressAudioBatch = useCallback(async (files: File[], customOptions: CompressionOptions = {}) => {
    return await compressBatch(files.filter(f => f.name.match(/\.(mp3|wav|ogg|aac|m4a|flac|wma)$/i)), customOptions);
  }, [compressBatch]);

  const compressVideoBatch = useCallback(async (files: File[], customOptions: CompressionOptions = {}) => {
    return await compressBatch(files.filter(f => f.name.match(/\.(mp4|avi|mkv|webm|mov|wmv|flv|3gp)$/i)), customOptions);
  }, [compressBatch]);

  return {
    // Main compression functions
    compressAudio: handleAudioCompression,
    compressVideo: handleVideoCompression,
    compressImage: handleImageCompression,
    compressPdf: handlePdfCompression,

    // Batch processing functions
    compressBatch,
    compressAudioBatch,
    compressVideoBatch,

    // UI state
    isCompressing,
    compressionProgress,
    compressionStats,
    error,
    isFFmpegLoaded,
    isFFmpegLoading,
    
    // Multithreading state
    queueStatus,
    batchProgress,
    threadConfig,

    // Manual initialization
    manualInitialize,

    // Utility functions
    clearError,
    updateQueueStatus,
    getThreadInfo: () => getThreadConfigInfo(),
    getLatestStats: () => compressionStats[compressionStats.length - 1] || null,
    getTotalCompressions: () => compressionStats.length,
    getAverageCompressionRatio: () => {
      if (compressionStats.length === 0) return 0;
      const total: number = compressionStats.reduce((sum: number, stat: CompressionStats) => sum + stat.compressionRatio, 0);
      return total / compressionStats.length;
    }
  };
};