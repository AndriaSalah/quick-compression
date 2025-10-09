/**
 * Smart compression defaults based on file type and size
 * Provides optimized settings for different scenarios
 */

import { CompressionOptions } from '@/types';

/**
 * Gets smart default compression options based on file characteristics
 */
export const getSmartDefaults = (
  file: File,
  type: 'audio' | 'video' | 'image' | 'pdf',
  currentOptions?: CompressionOptions
): CompressionOptions => {
  const fileSizeMB = file.size / (1024 * 1024);
  
  switch (type) {
    case 'audio':
      return getAudioDefaults(fileSizeMB, currentOptions);
    case 'video':
      return getVideoDefaults(fileSizeMB, currentOptions);
    case 'image':
      return getImageDefaults(fileSizeMB, currentOptions);
    case 'pdf':
      return getPdfDefaults(fileSizeMB, currentOptions);
    default:
      return {};
  }
};

/**
 * Audio compression defaults
 */
const getAudioDefaults = (fileSizeMB: number, currentOptions?: CompressionOptions): CompressionOptions => {
  const baseFormat = currentOptions?.outputFormat || 'mp3';
  
  // Voice note optimization
  if (fileSizeMB < 5) {
    return {
      outputFormat: baseFormat,
      bitrate: '32k',
      sampleRate: '16000',
      channels: 1,
      acodec: baseFormat === 'mp3' ? 'mp3' : 'aac'
    };
  }
  
  // Music/high quality audio
  if (fileSizeMB < 20) {
    return {
      outputFormat: baseFormat,
      bitrate: '64k',
      sampleRate: '22050',
      channels: 2,
      acodec: baseFormat === 'mp3' ? 'mp3' : 'aac'
    };
  }
  
  // Large audio files - aggressive compression
  return {
    outputFormat: baseFormat,
    bitrate: '48k',
    sampleRate: '16000',
    channels: 1,
    acodec: baseFormat === 'mp3' ? 'mp3' : 'aac'
  };
};

/**
 * Video compression defaults
 */
const getVideoDefaults = (fileSizeMB: number, currentOptions?: CompressionOptions): CompressionOptions => {
  // Don't override outputFormat if it's already set by user
  const baseFormat = currentOptions?.outputFormat || 'mp4';
  
  // Small videos - maintain quality
  if (fileSizeMB < 10) {
    return {
      outputFormat: baseFormat,
      vcodec: 'libx264',
      crf: 23,
      preset: 'fast',
      maxWidth: 720,
      acodec: 'aac',
      bitrate: '64k'
    };
  }
  
  // Medium videos - balance quality/size
  if (fileSizeMB < 50) {
    return {
      outputFormat: baseFormat,
      vcodec: 'libx264',
      crf: 27,
      preset: 'faster',
      maxWidth: 720,
      acodec: 'aac',
      bitrate: '48k'
    };
  }
  
  // Large videos - aggressive compression
  return {
    outputFormat: baseFormat,
    vcodec: 'libx264',
    crf: 30,
    preset: 'ultrafast',
    maxWidth: 480,
    acodec: 'aac',
    bitrate: '32k'
  };
};

/**
 * Image compression defaults
 */
const getImageDefaults = (fileSizeMB: number, currentOptions?: CompressionOptions): CompressionOptions => {
  const baseFormat = currentOptions?.outputFormat || 'jpeg';
  
  // Small images - light compression
  if (fileSizeMB < 1) {
    return {
      outputFormat: baseFormat,
      quality: 85,
      maxWidth: 1920
    };
  }
  
  // Medium images - moderate compression
  if (fileSizeMB < 5) {
    return {
      outputFormat: baseFormat,
      quality: 75,
      maxWidth: 1080
    };
  }
  
  // Large images - aggressive compression
  return {
    outputFormat: baseFormat,
    quality: 65,
    maxWidth: 720
  };
};

/**
 * PDF compression defaults (placeholder for future implementation)
 */
const getPdfDefaults = (fileSizeMB: number, currentOptions?: CompressionOptions): CompressionOptions => {
  return {
    outputFormat: currentOptions?.outputFormat || 'pdf',
    quality: 75
  };
};