"use client"

import { useCallback } from 'react';
import { AudioCompressionOptions } from '@/types';
import { formatFileSizeMB, calculateCompressionStats } from '@/lib/utils/compression-helpers';
import { buildAudioArgs, generateFFmpegFileNames } from '@/lib/utils/ffmpeg-args-builder';
import { logFFmpegDebugInfo, parseFFmpegError } from '@/lib/utils/ffmpeg-error-logger';
import { useFFmpeg } from './useFFmpeg';
import { getThreadConfigInfo } from './threadUtils';
import { useCompressionStore } from '@/store/compression-store';

// Codec to format mapping
const codecToFormat: Record<string, string> = {
  'libmp3lame': 'mp3',
  'mp3': 'mp3',
  'aac': 'aac',
  'libvorbis': 'ogg',
  'libopus': 'ogg',
  'opus': 'ogg',
  'pcm_s16le': 'wav',
  'flac': 'flac',
};

// Format to MIME type mapping
const mimeMap: Record<string, string> = {
  mp3: 'audio/mp3',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
};



export const useAudioCompression = () => {
  const {
    initializeFFmpeg,
    getFFmpegUtils,
    clearError,
    setCompressionProgress
  } = useFFmpeg();
  const { audioOptions } = useCompressionStore();
  const compressAudio = useCallback(async (
    file: File,
  ): Promise<Blob> => {
    clearError();
    setCompressionProgress(0);

    try {
 
      const ffmpegInstance = await initializeFFmpeg();
      const { fetchFile: fetchFileUtil } = await getFFmpegUtils();

      // Determine output format from codec if not explicitly set
      let outputFormat = audioOptions.outputFormat;
      if (!outputFormat && audioOptions.acodec) {
        outputFormat = codecToFormat[audioOptions.acodec] || 'mp3';
      }
      outputFormat = outputFormat || 'mp3';

      const { inputFileName, outputFileName } = generateFFmpegFileNames(file.name, outputFormat);

      // Build compression arguments with the computed output format
      const finalOptions = { ...audioOptions, outputFormat };
      const args = buildAudioArgs(finalOptions, inputFileName, outputFileName);

      // Log detailed debug information
      logFFmpegDebugInfo(args, finalOptions, file.name);

      // Write input file to FFmpeg's virtual file system
      await ffmpegInstance.writeFile(inputFileName, await fetchFileUtil(file));
      
      // Reset progress to 0 before starting
      setCompressionProgress(0);

      await ffmpegInstance.exec(args);

      // Check if the output file exists and has content
      const compressedData = await ffmpegInstance.readFile(outputFileName);

      
      if (compressedData.length === 0) {
        console.error('💥 CRITICAL ERROR: FFmpeg produced empty output file!');
        console.log(' Debugging information:');
        console.log('  - Input file size:', file.size, 'bytes');
        console.log('  - Codec used:', audioOptions.acodec);
        console.log('  - Output format:', outputFormat);
        console.log('  - Arguments passed:', args);
        throw new Error(`FFmpeg produced empty output file. This indicates a codec incompatibility or invalid arguments. Codec: ${audioOptions.acodec}, Format: ${outputFormat}`);
      }

      const mimeType = mimeMap[outputFormat] || 'audio/mp3';

      const compressedBlob = new Blob([compressedData], { type: mimeType });

      // Calculate compression stats
      const stats = calculateCompressionStats(file.size, compressedBlob.size);

      // Cleanup virtual files
      await ffmpegInstance.deleteFile(inputFileName);
      await ffmpegInstance.deleteFile(outputFileName);

      // Set progress to 100% when complete
      setCompressionProgress(100);

      return compressedBlob;

    } catch (err) {
      // Parse FFmpeg error for better debugging
      const ffmpegError = parseFFmpegError(err);
      console.error('FFmpeg Error Details:', ffmpegError);
      
      const errorMessage = `Audio compression failed: ${ffmpegError.message}`;
      throw new Error(errorMessage);
    } finally {
      // Reset progress after completion
      setTimeout(() => setCompressionProgress(null), 1000);
    }
  }, [initializeFFmpeg, audioOptions, getFFmpegUtils, clearError, setCompressionProgress]);

  return {
    compressAudio
  };
};