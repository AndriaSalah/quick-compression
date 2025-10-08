import { CompressionOptions } from '@/types';
import { getFileExtension } from './compression-helpers';

/**
 * Builds FFmpeg arguments for audio compression
 * @param options - Compression options
 * @param inputFileName - Input file name
 * @param outputFileName - Output file name
 * @returns Array of FFmpeg arguments
 */
export function buildAudioArgs(
  options: CompressionOptions,
  inputFileName: string,
  outputFileName: string
): string[] {
  let args = ['-i', inputFileName];

  // Use custom args if provided, otherwise build from options
  if (options.customArgs && options.customArgs.length > 0) {
    args = args.concat(options.customArgs);
    args.push(outputFileName);
    return args;
  }

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

  return args;
}

/**
 * Builds FFmpeg arguments for video compression
 * @param options - Compression options
 * @param inputFileName - Input file name
 * @param outputFileName - Output file name
 * @returns Array of FFmpeg arguments
 */
export function buildVideoArgs(
  options: CompressionOptions,
  inputFileName: string,
  outputFileName: string
): string[] {
  let args = ['-i', inputFileName];

  // Use custom args if provided, otherwise build from options
  if (options.customArgs && options.customArgs.length > 0) {
    args = args.concat(options.customArgs);
    args.push(outputFileName);
    return args;
  }

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

  // Preset
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

  return args;
}

/**
 * Generates appropriate file names for FFmpeg operations
 * @param originalFileName - The original file name
 * @param outputFormat - The desired output format
 * @returns Object with input and output file names
 */
export function generateFFmpegFileNames(originalFileName: string, outputFormat?: string) {
  const timestamp = Date.now();
  const inputFileName = `input_${timestamp}.${getFileExtension(originalFileName)}`;
  const outputFileName = `output_${timestamp}.${outputFormat || 'mp4'}`;
  
  return {
    inputFileName,
    outputFileName
  };
}

/**
 * Gets appropriate MIME type for compressed file
 * @param outputFormat - The output format
 * @param mediaType - The media type ('audio', 'video', or 'pdf')
 * @returns MIME type string
 */
export function getOutputMimeType(outputFormat: string, mediaType: 'audio' | 'video' | 'pdf'): string {
  if (mediaType === 'audio') {
    switch (outputFormat) {
      case 'mp3': return 'audio/mp3';
      case 'ogg': return 'audio/ogg';
      case 'wav': return 'audio/wav';
      default: return 'audio/aac';
    }
  } else if (mediaType === 'video') {
    switch (outputFormat) {
      case 'webm': return 'video/webm';
      case 'mkv': return 'video/x-matroska';
      default: return 'video/mp4';
    }
  } else if (mediaType === 'pdf') {
    return 'application/pdf';
  }
  
  return 'application/octet-stream';
}

/**
 * Builds FFmpeg arguments for PDF compression
 * @param options - Compression options
 * @param inputFileName - Input file name
 * @param outputFileName - Output file name
 * @returns Array of FFmpeg arguments
 */
export function buildPdfArgs(
  options: CompressionOptions,
  inputFileName: string,
  outputFileName: string
): string[] {
  let args = ['-i', inputFileName];

  // Use custom args if provided, otherwise build from options
  if (options.customArgs && options.customArgs.length > 0) {
    args = args.concat(options.customArgs);
    args.push(outputFileName);
    return args;
  }

  // Convert to PDF using image2pdf filter
  args.push('-f', 'pdf');
  
  // PDF quality settings
  const quality = options.pdfQuality || 'ebook';
  switch (quality) {
    case 'screen':
      args.push('-q:v', '0'); // Lowest quality, smallest size
      break;
    case 'ebook':
      args.push('-q:v', '1'); // Good quality for ebooks
      break;
    case 'printer':
      args.push('-q:v', '2'); // Good quality for printing
      break;
    case 'prepress':
      args.push('-q:v', '3'); // Highest quality
      break;
    default:
      args.push('-q:v', '1');
  }

  // Grayscale conversion
  if (options.grayscale) {
    args.push('-vf', 'format=gray');
  }

  // Compression
  args.push('-compression_level', '6');

  args.push(outputFileName);
  return args;
}