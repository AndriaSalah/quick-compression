"use client"

import { useCallback } from 'react';
import { calculateCompressionStats } from '@/lib/utils/compression-helpers';
import { buildVideoArgs, generateFFmpegFileNames } from '@/lib/utils/ffmpeg-args-builder';
import { logFFmpegDebugInfo, parseFFmpegError } from '@/lib/utils/ffmpeg-error-logger';
import { useFFmpeg } from './useFFmpeg';
import { useCompressionStore } from '@/store/compression-store';

// Codec to format mapping for video
const codecToFormat: Record<string, string> = {
  'libx264': 'mp4',
  'libx265': 'mp4', 
  'libvpx': 'webm',
};

// Format to MIME type mapping
const mimeMap: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
};

export const useVideoCompression = () => {
  const {
    initializeFFmpeg,
    getFFmpegUtils,
    clearError,
    setCompressionProgress
  } = useFFmpeg();
  const { videoOptions } = useCompressionStore();

  const compressVideo = useCallback(async (
    file: File,
  ): Promise<Blob> => {
    clearError();
    setCompressionProgress(0);
    
    try {

      const ffmpegInstance = await initializeFFmpeg();
      const { fetchFile: fetchFileUtil } = await getFFmpegUtils();

      // Determine output format from codec if not explicitly set
      let outputFormat = videoOptions.outputFormat;
      if (!outputFormat && videoOptions.vcodec) {
        outputFormat = codecToFormat[videoOptions.vcodec] || 'mp4';
      }
      outputFormat = outputFormat || 'mp4';

      const { inputFileName, outputFileName } = generateFFmpegFileNames(file.name, outputFormat);

      await ffmpegInstance.writeFile(inputFileName, await fetchFileUtil(file));

      // Build compression arguments with the computed output format
      const finalOptions = { ...videoOptions, outputFormat };
      const args = buildVideoArgs(finalOptions, inputFileName, outputFileName);

      // Log detailed debug information
      logFFmpegDebugInfo(args, finalOptions, file.name);

      // Reset progress to 0 before starting
      setCompressionProgress(0);

      await ffmpegInstance.exec(args);
     
      // Check if the output file exists and has content

      const compressedData = await ffmpegInstance.readFile(outputFileName);
   
      
      if (compressedData.length === 0) {
        console.error('💥 CRITICAL ERROR: FFmpeg produced empty output file!');
        console.log(' Debugging information:');
        console.log('  - Input file size:', file.size, 'bytes');
        console.log('  - Video codec used:', videoOptions.vcodec);
        console.log('  - Output format:', outputFormat);
        console.log('  - Arguments passed:', args);
        throw new Error(`FFmpeg produced empty output file. This indicates a codec incompatibility or invalid arguments. Codec: ${videoOptions.vcodec}, Format: ${outputFormat}`);
      }

      const mimeType = mimeMap[outputFormat] || 'video/mp4';
  
      
      const compressedBlob = new Blob([compressedData], { type: mimeType });
    
      // console.log('🧹 Cleaning up virtual files...');
      await ffmpegInstance.deleteFile(inputFileName);
      await ffmpegInstance.deleteFile(outputFileName);
    
      // Set progress to 100% when complete
      setCompressionProgress(100);

      return compressedBlob;

    } catch (err) {
      // Parse FFmpeg error for better debugging
      const ffmpegError = parseFFmpegError(err);
      console.error('FFmpeg Video Error Details:', ffmpegError);
      
      const errorMessage = `Video compression failed: ${ffmpegError.message}`;
      throw new Error(errorMessage);
    } finally {
      // Reset progress after completion
      setTimeout(() => setCompressionProgress(null), 1000);
    }
  }, [initializeFFmpeg, videoOptions, getFFmpegUtils, clearError, setCompressionProgress]);

  return {
    compressVideo
  };
};