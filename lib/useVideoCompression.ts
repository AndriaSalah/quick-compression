"use client"

import { useCallback } from 'react';
import { CompressionOptions } from '@/types';
import { formatFileSizeMB, calculateCompressionStats } from '@/lib/utils/compression-helpers';
import { getSmartDefaults } from '@/lib/utils/compression-defaults';
import { buildVideoArgs, generateFFmpegFileNames, getOutputMimeType } from '@/lib/utils/ffmpeg-args-builder';
import { useFFmpeg } from './useFFmpeg';
import { getThreadConfigInfo } from './threadUtils';

export const useVideoCompression = (defaultOptions: CompressionOptions = {}) => {
  const {
    initializeFFmpeg,
    getFFmpegUtils,
    clearError,
    setCompressionProgress
  } = useFFmpeg();

  const compressVideo = useCallback(async (
    file: File,
    customOptions: CompressionOptions = {}
  ): Promise<Blob> => {
    clearError();
    setCompressionProgress(0);
    console.log('Compressing Video');
    
    try {
      const ffmpegInstance = await initializeFFmpeg();
      const { fetchFile: fetchFileUtil } = await getFFmpegUtils();

      const mergedOptions = {
        ...defaultOptions,
        ...customOptions
      };

      const options = {
        ...getSmartDefaults(file, 'video', mergedOptions),
        ...mergedOptions
      };

      const outputFormat = options.outputFormat || 'mp4';
      const { inputFileName, outputFileName } = generateFFmpegFileNames(file.name, outputFormat);

      console.log('Starting video compression...', { inputFileName, outputFileName });

      await ffmpegInstance.writeFile(inputFileName, await fetchFileUtil(file));

      // Build compression arguments
      const args = buildVideoArgs(options, inputFileName, outputFileName);

      console.log('Video compression args (with multithreading):', args);
      console.log('Thread config:', getThreadConfigInfo());

      // Reset progress to 0 before starting
      setCompressionProgress(0);

      await ffmpegInstance.exec(args);

      const compressedData = await ffmpegInstance.readFile(outputFileName);
      const mimeType = getOutputMimeType(outputFormat, 'video');
      const compressedBlob = new Blob([compressedData], { type: mimeType });

      // Stats tracking
      const stats = calculateCompressionStats(file.size, compressedBlob.size);
      console.log(`Video compression complete: ${formatFileSizeMB(file.size)} → ${formatFileSizeMB(compressedBlob.size)} (${stats.compressionRatio.toFixed(1)}% smaller)`);

      // Cleanup
      await ffmpegInstance.deleteFile(inputFileName);
      await ffmpegInstance.deleteFile(outputFileName);

      // Set progress to 100% when complete
      setCompressionProgress(100);

      return compressedBlob;

    } catch (err) {
      const errorMessage = `Video compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      throw new Error(errorMessage);
    } finally {
      // Reset progress after completion
      setTimeout(() => setCompressionProgress(null), 1000);
    }
  }, [initializeFFmpeg, defaultOptions, getFFmpegUtils, clearError, setCompressionProgress]);

  return {
    compressVideo
  };
};