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
      console.log('🎯 STARTING AUDIO COMPRESSION PROCESS');
      console.log('📊 Input file details:', {
        name: file.name,
        size: `${formatFileSizeMB(file.size)} MB`,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });

      const ffmpegInstance = await initializeFFmpeg();
      const { fetchFile: fetchFileUtil } = await getFFmpegUtils();

      // Determine output format from codec if not explicitly set
      let outputFormat = audioOptions.outputFormat;
      if (!outputFormat && audioOptions.acodec) {
        outputFormat = codecToFormat[audioOptions.acodec] || 'mp3';
      }
      outputFormat = outputFormat || 'mp3';

      console.log('🔄 Format determination:', {
        originalFormat: audioOptions.outputFormat,
        detectedFromCodec: audioOptions.acodec ? codecToFormat[audioOptions.acodec] : null,
        finalFormat: outputFormat,
        codecToFormatMap: codecToFormat
      });

      const { inputFileName, outputFileName } = generateFFmpegFileNames(file.name, outputFormat);

      console.log('📝 Generated file names:', { inputFileName, outputFileName });

      // Build compression arguments with the computed output format
      const finalOptions = { ...audioOptions, outputFormat };
      const args = buildAudioArgs(finalOptions, inputFileName, outputFileName);

      // Log detailed debug information
      logFFmpegDebugInfo(args, finalOptions, file.name);

      console.log('🔧 Final FFmpeg arguments:', args);
      console.log('⚙️ Thread configuration:', getThreadConfigInfo());
      
      // For debugging: check codec support if using opus/vorbis
      if (audioOptions.acodec === 'opus' || audioOptions.acodec === 'vorbis') {
        console.log(`🎵 Codec Analysis - Attempting ${audioOptions.acodec} compression`);
        console.log('🔍 Critical codec checks:', {
          codecNormalization: audioOptions.acodec === 'opus' ? 'opus → libopus' : 'vorbis → libvorbis',
          targetContainer: outputFormat,
          isValidCombination: (audioOptions.acodec === 'opus' && outputFormat === 'ogg') || 
                             (audioOptions.acodec === 'vorbis' && outputFormat === 'ogg'),
          expectedFileExtension: `.${outputFormat}`,
          mimeType: mimeMap[outputFormat]
        });
      }

      console.log('📤 Writing input file to FFmpeg virtual filesystem...');
      // Write input file to FFmpeg's virtual file system
      await ffmpegInstance.writeFile(inputFileName, await fetchFileUtil(file));
      console.log('✅ Input file written successfully');
      
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
        console.log('  - Codec used:', audioOptions.acodec);
        console.log('  - Output format:', outputFormat);
        console.log('  - Arguments passed:', args);
        throw new Error(`FFmpeg produced empty output file. This indicates a codec incompatibility or invalid arguments. Codec: ${audioOptions.acodec}, Format: ${outputFormat}`);
      }

      const mimeType = mimeMap[outputFormat] || 'audio/mp3';
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

      console.log(`🎉 Audio compression SUCCESS:`, {
        inputSize: formatFileSizeMB(file.size),
        outputSize: formatFileSizeMB(compressedBlob.size),
        compressionRatio: `${stats.compressionRatio.toFixed(1)}% reduction`,
        format: outputFormat,
        codec: audioOptions.acodec,
        mimeType: mimeType,
        processingTime: 'completed'
      });

      // Cleanup virtual files
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