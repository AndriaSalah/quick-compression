"use client"

import { useState } from 'react';
import { CompressionOptions, CompressionStats } from '@/types';
import { useFFmpeg } from './useFFmpeg';
import { useAudioCompression } from './useAudioCompression';
import { useVideoCompression } from './useVideoCompression';
import { useImageCompression } from './useImageCompression';
import { usePdfCompression } from './usePdfCompression';

export const useCompression = (defaultOptions: CompressionOptions = {}) => {
  // Use FFmpeg hook for state management
  const {
    isFFmpegLoaded,
    isFFmpegLoading,
    error,
    compressionProgress,
    manualInitialize,
    clearError
  } = useFFmpeg();

  // Specialized compression hooks
  const { compressAudio } = useAudioCompression(defaultOptions);
  const { compressVideo } = useVideoCompression(defaultOptions);
  const { compressImage } = useImageCompression(defaultOptions);
  const { compressPdf } = usePdfCompression(defaultOptions);

  // UI state
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionStats[]>([]);

  // Wrapper functions that handle common state management
  const handleAudioCompression = async (file: File, customOptions: CompressionOptions = {}): Promise<Blob> => {
    setIsCompressing(true);
    try {
      const result = await compressAudio(file, customOptions);
      // Note: stats are already logged in the specialized hook
      return result;
    } finally {
      setIsCompressing(false);
    }
  };

  const handleVideoCompression = async (file: File, customOptions: CompressionOptions = {}): Promise<Blob> => {
    setIsCompressing(true);
    try {
      const result = await compressVideo(file, customOptions);
      // Note: stats are already logged in the specialized hook
      return result;
    } finally {
      setIsCompressing(false);
    }
  };

  const handleImageCompression = async (file: File, customOptions: CompressionOptions = {}): Promise<Blob> => {
    setIsCompressing(true);
    try {
      const result = await compressImage(file, customOptions);
      // Note: stats are already logged in the specialized hook
      return result;
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePdfCompression = async (file: File, customOptions: CompressionOptions = {}): Promise<Blob> => {
    setIsCompressing(true);
    try {
      const result = await compressPdf(file, customOptions);
      // Note: stats are already logged in the specialized hook
      return result;
    } finally {
      setIsCompressing(false);
    }
  };

  return {
    // Main compression functions
    compressAudio: handleAudioCompression,
    compressVideo: handleVideoCompression,
    compressImage: handleImageCompression,
    compressPdf: handlePdfCompression,

    // UI state
    isCompressing,
    compressionProgress,
    compressionStats,
    error,
    isFFmpegLoaded,
    isFFmpegLoading,

    // Manual initialization
    manualInitialize,

    // Utility functions
    clearError,
    getLatestStats: () => compressionStats[compressionStats.length - 1] || null,
    getTotalCompressions: () => compressionStats.length,
    getAverageCompressionRatio: () => {
      if (compressionStats.length === 0) return 0;
      const total: number = compressionStats.reduce((sum: number, stat: CompressionStats) => sum + stat.compressionRatio, 0);
      return total / compressionStats.length;
    }
  };
};