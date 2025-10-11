"use client"

import { useCallback } from 'react';
import { CompressionOptions, ImageCompressionOptions } from '@/types';
import { formatFileSizeMB, calculateNewDimensions, calculateCompressionStats } from '@/utils/compression-helpers';
import { useFFmpeg } from './useFFmpeg';
import { useCompressionStore } from '@/store/compression-store';

const mimeMap: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
};

export const useImageCompression = () => {
  const { setCompressionProgress, clearError } = useFFmpeg();
  const {imageOptions} = useCompressionStore()

  const compressImage = useCallback(async (
    file: File,
  ): Promise<Blob> => {
    clearError();
    setCompressionProgress(0);

    try {
      
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Simulate progress updates
          setCompressionProgress(25);

          // Calculate new dimensions maintaining aspect ratio
          const { width, height } = calculateNewDimensions(
            img.width,
            img.height,
            imageOptions.maxWidth!,
            imageOptions.maxHeight!
          );

          canvas.width = width;
          canvas.height = height;

          setCompressionProgress(50);

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);

          setCompressionProgress(75);

          const outputType = imageOptions.outputFormat ? mimeMap[imageOptions.outputFormat] : 'image/jpeg';
          const quality = imageOptions.imageQuality || 0.8;

          canvas.toBlob((blob) => {
            if (blob) {
              // Track stats
              const stats = calculateCompressionStats(file.size, blob.size);
              
              setCompressionProgress(100);
              
              // Reset progress after a short delay
              setTimeout(() => setCompressionProgress(null), 1000);
              
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, outputType, quality);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = URL.createObjectURL(file);
        setCompressionProgress(10);
      });

    } catch (err) {
      const errorMessage = `Image compression failed: ${err instanceof Error ? err.message : err}}`;
      throw new Error(errorMessage);
    }
  }, [imageOptions, setCompressionProgress, clearError]);

  return {
    compressImage
  };
};