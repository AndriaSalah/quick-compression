/**
 * FFmpeg arguments builder with multithreading support
 * Provides optimized command line arguments for different compression types
 */

import { CompressionOptions } from '@/types';
import { getFFmpegThreadArgs } from '@/lib/threadUtils';

/**
 * Generates unique file names for FFmpeg operations
 */
export const generateFFmpegFileNames = (originalName: string, outputFormat: string) => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || 'tmp';
  
  return {
    inputFileName: `input_${timestamp}.${extension}`,
    outputFileName: `output_${timestamp}.${outputFormat}`
  };
};

/**
 * Gets appropriate MIME type for output format and media type
 */
export const getOutputMimeType = (outputFormat: string, mediaType: 'audio' | 'video' | 'image'): string => {
  switch (mediaType) {
    case 'audio':
      switch (outputFormat) {
        case 'mp3': return 'audio/mp3';
        case 'ogg': return 'audio/ogg';
        case 'wav': return 'audio/wav';
        case 'aac': return 'audio/aac';
        default: return 'audio/mp3';
      }
    case 'video':
      switch (outputFormat) {
        case 'webm': return 'video/webm';
        case 'mkv': return 'video/x-matroska';
        case 'avi': return 'video/x-msvideo';
        default: return 'video/mp4';
      }
    case 'image':
      switch (outputFormat) {
        case 'jpeg': case 'jpg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'webp': return 'image/webp';
        case 'avif': return 'image/avif';
        default: return 'image/jpeg';
      }
    default:
      return 'application/octet-stream';
  }
};

/**
 * Builds FFmpeg arguments for audio compression with multithreading
 */
export const buildAudioArgs = (
  options: CompressionOptions,
  inputFileName: string,
  outputFileName: string
): string[] => {
  let args = ['-i', inputFileName];
  
  // Add threading arguments for optimal performance
  const threadArgs = getFFmpegThreadArgs('audio');
  args = args.concat(threadArgs);

  // Use custom args if provided, otherwise build from options
  if (options.customArgs && options.customArgs.length > 0) {
    args = args.concat(options.customArgs);
    args.push(outputFileName);
  } else {
    const outputFormat = options.outputFormat || 'mp3';

    // Audio codec
    if (options.acodec) {
      args.push('-acodec', options.acodec);
    } else {
      args.push('-acodec', outputFormat === 'mp3' ? 'mp3' : 'aac');
    }

    // Bitrate
    if (options.bitrate) {
      args.push('-b:a', options.bitrate);
    } else {
      args.push('-b:a', '32k');
    }

    // Sample rate
    if (options.sampleRate) {
      args.push('-ar', options.sampleRate);
    } else {
      args.push('-ar', '16000');
    }

    // Channels
    if (options.channels !== undefined) {
      args.push('-ac', options.channels.toString());
    } else {
      args.push('-ac', '1');
    }

    // Audio filters for voice optimization
    args.push('-af', 'highpass=f=80,lowpass=f=8000,volume=1.2');
    
    // Quality setting for smaller size
    args.push('-q:a', '9');
    args.push(outputFileName);
  }

  return args;
};

/**
 * Builds FFmpeg arguments for video compression with multithreading
 */
export const buildVideoArgs = (
  options: CompressionOptions,
  inputFileName: string,
  outputFileName: string
): string[] => {
  let args = ['-i', inputFileName];
  
  // Add threading arguments for optimal performance
  const threadArgs = getFFmpegThreadArgs('video');
  args = args.concat(threadArgs);

  // Use custom args if provided, otherwise build from options
  if (options.customArgs && options.customArgs.length > 0) {
    args = args.concat(options.customArgs);
    args.push(outputFileName);
  } else {
    // Video codec
    if (options.vcodec) {
      args.push('-vcodec', options.vcodec);
    } else {
      args.push('-vcodec', 'libx264');
    }

    // CRF (quality)
    if (options.crf !== undefined) {
      args.push('-crf', options.crf.toString());
    } else {
      args.push('-crf', '27');
    }

    // Preset (ultrafast for better threading performance)
    if (options.preset) {
      args.push('-preset', options.preset);
    } else {
      args.push('-preset', 'ultrafast');
    }

    // Scale/resolution
    if (options.scale) {
      args.push('-vf', options.scale);
    } else if (options.maxWidth) {
      args.push('-vf', `scale='min(${options.maxWidth},iw)':-2`);
    } else {
      args.push('-vf', `scale='min(720,iw)':-2`);
    }

    // Audio codec
    if (options.acodec) {
      args.push('-acodec', options.acodec);
    } else {
      args.push('-acodec', 'aac');
    }

    // Audio bitrate
    if (options.bitrate) {
      args.push('-b:a', options.bitrate);
    } else {
      args.push('-b:a', '48k');
    }

    // Optimization for web
    args.push('-movflags', '+faststart');
    
    args.push(outputFileName);
  }

  return args;
};

/**
 * Builds FFmpeg arguments for image compression with multithreading
 */
export const buildImageArgs = (
  options: CompressionOptions,
  inputFileName: string,
  outputFileName: string
): string[] => {
  let args = ['-i', inputFileName];
  
  // Add threading arguments for optimal performance
  const threadArgs = getFFmpegThreadArgs('image');
  args = args.concat(threadArgs);

  // Use custom args if provided, otherwise build from options
  if (options.customArgs && options.customArgs.length > 0) {
    args = args.concat(options.customArgs);
    args.push(outputFileName);
  } else {
    const outputFormat = options.outputFormat || 'jpeg';

    // Quality setting
    if (options.quality !== undefined) {
      if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
        args.push('-q:v', Math.round(31 - (options.quality * 0.31)).toString());
      } else if (outputFormat === 'webp') {
        args.push('-quality', options.quality.toString());
      }
    } else {
      if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
        args.push('-q:v', '15'); // Good quality/size balance
      } else if (outputFormat === 'webp') {
        args.push('-quality', '75');
      }
    }

    // Resolution scaling
    if (options.maxWidth) {
      args.push('-vf', `scale='min(${options.maxWidth},iw)':-2`);
    }

    args.push(outputFileName);
  }

  return args;
};