/**
 * FFmpeg Error Logging and Parsing Utilities
 * Provides detailed error messages and debugging information for FFmpeg operations
 */

export interface FFmpegError {
  type: 'codec_incompatible' | 'format_unsupported' | 'file_error' | 'memory_error' | 'unknown';
  message: string;
  details: string;
  suggestions: string[];
  originalError: string;
}

/**
 * Parses FFmpeg error messages and provides user-friendly explanations
 */
export function parseFFmpegError(error: any): FFmpegError {
  const errorString = error?.toString() || '';
  const errorMessage = error?.message || errorString;
  
  console.group('🔍 FFmpeg Error Analysis');
  console.log('Raw error:', error);
  console.log('Error string:', errorString);
  console.log('Error message:', errorMessage);
  console.groupEnd();

  if (errorString.includes('memory access out of bounds') || errorString.includes('RuntimeError')) {
    return {
      type: 'codec_incompatible',
      message: 'Codec parameters are incompatible with the selected format',
      details: 'This often occurs when using codec-specific options that are not compatible with the chosen output format or codec.',
      suggestions: [
        'For WebM format: Use VP9 codec with Opus audio (avoid AAC and x264 presets)',
        'For MP4 format: Use H.264 codec with AAC audio',
        'Try using default settings without custom presets',
        'Check if the selected codec supports the chosen container format'
      ],
      originalError: errorString
    };
  }

  // Common FFmpeg error patterns
  if (errorString.includes('Incompatible pixel format') || errorString.includes('codec not compatible')) {
    return {
      type: 'codec_incompatible',
      message: 'Codec is not compatible with the selected container format',
      details: `The selected video/audio codec cannot be used with the chosen output format.`,
      suggestions: [
        'For WebM format, use VP8/VP9 video codecs with Opus/Vorbis audio',
        'For MP4 format, use H.264/H.265 video codecs with AAC audio',
        'Check the format selector and ensure compatible codec combinations'
      ],
      originalError: errorString
    };
  }

  if (errorString.includes('Invalid data found when processing input') || errorString.includes('moov atom not found')) {
    return {
      type: 'file_error',
      message: 'Input file appears to be corrupted or invalid',
      details: 'The input file cannot be read properly by FFmpeg.',
      suggestions: [
        'Try uploading a different file',
        'Ensure the file is not corrupted',
        'Check if the file format is supported'
      ],
      originalError: errorString
    };
  }

  if (errorString.includes('No space left') || errorString.includes('Cannot allocate memory')) {
    return {
      type: 'memory_error',
      message: 'Insufficient memory or storage space',
      details: 'FFmpeg ran out of memory or storage space during processing.',
      suggestions: [
        'Try compressing a smaller file first',
        'Reduce the output quality settings',
        'Free up browser memory by closing other tabs'
      ],
      originalError: errorString
    };
  }

  if (errorString.includes('Unknown encoder') || errorString.includes('Encoder not found')) {
    return {
      type: 'codec_incompatible',
      message: 'Selected codec is not available',
      details: 'The requested encoder/codec is not available in this FFmpeg build.',
      suggestions: [
        'Try using a different codec (H.264 for video, AAC for audio)',
        'Check the codec compatibility with your selected format'
      ],
      originalError: errorString
    };
  }

  if (errorString.includes('Invalid argument') || errorString.includes('Option not found')) {
    return {
      type: 'format_unsupported',
      message: 'Invalid FFmpeg parameters',
      details: 'One or more compression parameters are invalid or unsupported.',
      suggestions: [
        'Try using default settings first',
        'Check if the selected format supports the chosen options'
      ],
      originalError: errorString
    };
  }

  // Default case for unknown errors
  return {
    type: 'unknown',
    message: 'Compression failed with an unknown error',
    details: `FFmpeg encountered an unexpected error: ${errorMessage}`,
    suggestions: [
      'Try using different compression settings',
      'Try a different output format',
      'Check the browser console for more details',
      'Ensure your file is valid and not corrupted'
    ],
    originalError: errorString
  };
}

/**
 * Logs detailed FFmpeg debugging information
 */
export function logFFmpegDebugInfo(args: string[], options: any, fileName: string) {
  console.group('🎬 FFmpeg Debug Information');
  console.log('📁 File:', fileName);
  console.log('⚙️ Compression Options:', options);
  console.log('🔧 FFmpeg Arguments:', args);
  console.log('📦 Output Format:', options.outputFormat || options.outputExtension);
  console.log('🎥 Video Codec:', options.vcodec);
  console.log('🔊 Audio Codec:', options.acodec);
  
  // Check for potential compatibility issues
  const warnings = [];
  
  if (options.outputFormat === 'mp4' && (options.vcodec === 'libvpx' || options.vcodec === 'libvpx-vp9')) {
    warnings.push('⚠️ VP8/VP9 codecs are not compatible with MP4 container. Use WebM instead.');
  }
  
  if (options.outputFormat === 'webm' && (options.vcodec === 'libx264' || options.vcodec === 'libx265')) {
    warnings.push('⚠️ H.264/H.265 codecs are not recommended for WebM container. Use VP8/VP9 instead.');
  }
  
  if (options.outputFormat === 'webm' && options.acodec === 'aac') {
    warnings.push('⚠️ AAC codec is not compatible with WebM container. Use Opus or Vorbis instead.');
  }
  
  if (options.outputFormat === 'webm' && options.preset && options.vcodec?.includes('vp')) {
    warnings.push('⚠️ VP8/VP9 codecs do not use x264 presets. Consider removing preset or switching to speed parameter.');
  }
  
  if (warnings.length > 0) {
    console.group('⚠️ Compatibility Warnings');
    warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Creates a user-friendly error message for the UI
 */
export function formatUserErrorMessage(error: FFmpegError): string {
  return `${error.message}\n\n${error.details}\n\nSuggestions:\n${error.suggestions.map(s => `• ${s}`).join('\n')}`;
}