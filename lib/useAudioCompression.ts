"use client"

import { useCallback } from 'react';
import { CompressionOptions } from '@/types';
import { formatFileSizeMB, calculateCompressionStats } from '@/lib/utils/compression-helpers';
import { getSmartDefaults } from '@/lib/utils/compression-defaults';
import { buildAudioArgs, generateFFmpegFileNames, getOutputMimeType } from '@/lib/utils/ffmpeg-args-builder';
import { useFFmpeg } from './useFFmpeg';
import { getThreadConfigInfo } from './threadUtils';

export const useAudioCompression = (defaultOptions: CompressionOptions = {}) => {
  const {
    initializeFFmpeg,
    getFFmpegUtils,
    clearError,
    setCompressionProgress
  } = useFFmpeg();

  const compressAudio = useCallback(async (
    file: File,
    customOptions: CompressionOptions = {}
  ): Promise<Blob> => {
    clearError();
    setCompressionProgress(0);

    try {
      const ffmpegInstance = await initializeFFmpeg();
      const { fetchFile: fetchFileUtil } = await getFFmpegUtils();

      // Merge options with smart defaults
      const mergedOptions = {
        ...defaultOptions,
        ...customOptions
      };

      const options = {
        ...getSmartDefaults(file, 'audio', mergedOptions),
        ...mergedOptions
      };

      const outputFormat = options.outputFormat || 'mp3';
      const { inputFileName, outputFileName } = generateFFmpegFileNames(file.name, outputFormat);

      console.log('Starting audio compression...', { inputFileName, outputFileName });

      // Write input file to FFmpeg's virtual file system
      await ffmpegInstance.writeFile(inputFileName, await fetchFileUtil(file));

      // Build compression arguments
      const args = buildAudioArgs(options, inputFileName, outputFileName);

      console.log('Audio compression args (with multithreading):', args);
      console.log('Thread config:', getThreadConfigInfo());
      
      // Reset progress to 0 before starting
      setCompressionProgress(0);
      
      await ffmpegInstance.exec(args);

      // Read the compressed file
      const compressedData = await ffmpegInstance.readFile(outputFileName);
      const mimeType = getOutputMimeType(outputFormat, 'audio');
      const compressedBlob = new Blob([compressedData], { type: mimeType });

      // Calculate compression stats
      const stats = calculateCompressionStats(file.size, compressedBlob.size);

      // Cleanup virtual files
      await ffmpegInstance.deleteFile(inputFileName);
      await ffmpegInstance.deleteFile(outputFileName);

      console.log(`Audio compression complete: ${formatFileSizeMB(file.size)} → ${formatFileSizeMB(compressedBlob.size)} (${stats.compressionRatio.toFixed(1)}% smaller)`);

      // Set progress to 100% when complete
      setCompressionProgress(100);

      return compressedBlob;

    } catch (err) {
      const errorMessage = `Audio compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      throw new Error(errorMessage);
    } finally {
      // Reset progress after completion
      setTimeout(() => setCompressionProgress(null), 1000);
    }
  }, [initializeFFmpeg, defaultOptions, getFFmpegUtils, clearError, setCompressionProgress]);

  return {
    compressAudio
  };
};