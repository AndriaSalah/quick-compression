"use client"

import { useCallback } from 'react';
import { CompressionOptions } from '@/types';
import { formatFileSizeMB, calculateNewDimensions, calculateCompressionStats } from '@/utils/compression-helpers';
import { useFFmpeg } from './useFFmpeg';

export const useImageCompression = (defaultOptions: CompressionOptions = {}) => {
  const { setCompressionProgress, clearError } = useFFmpeg();

  const compressImage = useCallback(async (
    file: File,
    customOptions: CompressionOptions = {}
  ): Promise<Blob> => {
    clearError();
    setCompressionProgress(0);

    try {
      const options = {
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 0.8,
        outputFormat: 'jpeg',
        ...defaultOptions,
        ...customOptions
      };

      console.log('Starting image compression...');

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
            options.maxWidth!,
            options.maxHeight!
          );

          canvas.width = width;
          canvas.height = height;

          setCompressionProgress(50);

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);

          setCompressionProgress(75);

          const outputType = options.outputFormat === 'png' ? 'image/png' : 'image/jpeg';
          const quality = options.imageQuality || 0.8;

          canvas.toBlob((blob) => {
            if (blob) {
              // Track stats
              const stats = calculateCompressionStats(file.size, blob.size);
              console.log(`Image compression complete: ${formatFileSizeMB(file.size)} → ${formatFileSizeMB(blob.size)} (${stats.compressionRatio.toFixed(1)}% smaller)`);
              
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
      const errorMessage = `Image compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      throw new Error(errorMessage);
    }
  }, [defaultOptions, setCompressionProgress, clearError]);

  return {
    compressImage
  };
};