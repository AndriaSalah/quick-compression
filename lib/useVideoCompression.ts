"use client"

import { useCallback } from 'react';
import { VideoCompressionOptions } from '@/types';
import { formatFileSizeMB, calculateCompressionStats } from '@/lib/utils/compression-helpers';
import { buildVideoArgs, generateFFmpegFileNames } from '@/lib/utils/ffmpeg-args-builder';
import { logFFmpegDebugInfo, parseFFmpegError } from '@/lib/utils/ffmpeg-error-logger';
import { useFFmpeg } from './useFFmpeg';
import { getThreadConfigInfo } from './threadUtils';
import { useCompressionStore } from '@/store/compression-store';

// Codec to format mapping for video
const codecToFormat: Record<string, string> = {
  'libx264': 'mp4',
  'libx265': 'mp4', 
  'libvpx-vp9': 'webm',
  'libvpx': 'webm',
  'libvp9': 'webm',
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
    console.log('🎬 STARTING VIDEO COMPRESSION PROCESS');
    
    try {
      console.log('📊 Input video details:', {
        name: file.name,
        size: `${formatFileSizeMB(file.size)} MB`,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });

      const ffmpegInstance = await initializeFFmpeg();
      const { fetchFile: fetchFileUtil } = await getFFmpegUtils();

      // Determine output format from codec if not explicitly set
      let outputFormat = videoOptions.outputFormat;
      if (!outputFormat && videoOptions.vcodec) {
        outputFormat = codecToFormat[videoOptions.vcodec] || 'mp4';
      }
      outputFormat = outputFormat || 'mp4';

      console.log('🔄 Format determination:', {
        originalFormat: videoOptions.outputFormat,
        detectedFromCodec: videoOptions.vcodec ? codecToFormat[videoOptions.vcodec] : null,
        finalFormat: outputFormat,
        codecToFormatMap: codecToFormat
      });

      const { inputFileName, outputFileName } = generateFFmpegFileNames(file.name, outputFormat);
      console.log('📝 Generated file names:', { inputFileName, outputFileName });

      console.log('📤 Writing input file to FFmpeg virtual filesystem...');
      await ffmpegInstance.writeFile(inputFileName, await fetchFileUtil(file));
      console.log('✅ Input file written successfully');

      // Build compression arguments with the computed output format
      const finalOptions = { ...videoOptions, outputFormat };
      const args = buildVideoArgs(finalOptions, inputFileName, outputFileName);

      // Log detailed debug information
      logFFmpegDebugInfo(args, finalOptions, file.name);

      console.log('🔧 Final FFmpeg arguments:', args);
      console.log('⚙️ Thread configuration:', getThreadConfigInfo());

      // Reset progress to 0 before starting
      setCompressionProgress(0);
      console.log('🚀 Executing FFmpeg compression...');

      await ffmpegInstance.exec(args);
      console.log('✅ FFmpeg execution completed');

      // Check if the output file exists and has content
      console.log('📖 Reading compressed output file...');
      const compressedData = await ffmpegInstance.readFile(outputFileName);
      console.log(`📊 Output file analysis:`, {
        outputFileName,
        rawDataSize: compressedData.length,
        sizeInBytes: `${compressedData.length} bytes`,
        sizeInKB: `${(compressedData.length / 1024).toFixed(2)} KB`,
        sizeInMB: `${(compressedData.length / (1024 * 1024)).toFixed(4)} MB`,
        isEmpty: compressedData.length === 0,
        dataType: typeof compressedData,
        isArrayBuffer: compressedData instanceof ArrayBuffer,
        isUint8Array: compressedData instanceof Uint8Array
      });
      
      if (compressedData.length === 0) {
        console.error('💥 CRITICAL ERROR: FFmpeg produced empty output file!');
        console.log('🔍 Debugging information:');
        console.log('  - Input file size:', file.size, 'bytes');
        console.log('  - Video codec used:', videoOptions.vcodec);
        console.log('  - Output format:', outputFormat);
        console.log('  - Arguments passed:', args);
        throw new Error(`FFmpeg produced empty output file. This indicates a codec incompatibility or invalid arguments. Codec: ${videoOptions.vcodec}, Format: ${outputFormat}`);
      }

      const mimeType = mimeMap[outputFormat] || 'video/mp4';
      console.log('🏷️ MIME type mapping:', {
        outputFormat,
        detectedMimeType: mimeType,
        availableMimeTypes: mimeMap
      });
      
      const compressedBlob = new Blob([compressedData], { type: mimeType });
      console.log('📦 Blob creation successful:', {
        blobSize: compressedBlob.size,
        blobType: compressedBlob.type,
        compressionRatio: `${((1 - compressedBlob.size / file.size) * 100).toFixed(1)}%`
      });

      // Calculate compression stats
      const stats = calculateCompressionStats(file.size, compressedBlob.size);
      console.log('📊 Compression statistics:', stats);

      console.log(`🎉 Video compression SUCCESS:`, {
        inputSize: formatFileSizeMB(file.size),
        outputSize: formatFileSizeMB(compressedBlob.size),
        compressionRatio: `${stats.compressionRatio.toFixed(1)}% reduction`,
        format: outputFormat,
        codec: videoOptions.vcodec,
        mimeType: mimeType,
        processingTime: 'completed'
      });

      console.log('🧹 Cleaning up virtual files...');
      await ffmpegInstance.deleteFile(inputFileName);
      await ffmpegInstance.deleteFile(outputFileName);
      console.log('✅ Cleanup completed');

      console.log(`📈 Final compression summary: ${formatFileSizeMB(file.size)} → ${formatFileSizeMB(compressedBlob.size)} (${stats.compressionRatio.toFixed(1)}% smaller)`);

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