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
  
  console.group('🔍 FFmpeg Comprehensive Error Analysis');
  console.log('🔴 Raw error object:', error);
  console.log('📝 Error string:', errorString);
  console.log('💬 Error message:', errorMessage);
  console.log('🏷️ Error type:', typeof error);
  console.log('🔧 Error stack:', error?.stack);
  
  // Log all error properties for debugging
  if (error && typeof error === 'object') {
    console.log('🔍 All error properties:');
    Object.keys(error).forEach(key => {
      console.log(`  ${key}:`, error[key]);
    });
  }
  console.groupEnd();

  // Check for specific FFmpeg.wasm errors
  if (errorString.includes('memory access out of bounds') || errorString.includes('RuntimeError')) {
    console.error('💥 DETECTED: Memory access violation - likely codec incompatibility');
    return {
      type: 'codec_incompatible',
      message: 'Codec parameters are incompatible with the selected format',
      details: 'This often occurs when using codec-specific options that are not compatible with the chosen output format or codec. FFmpeg.wasm encountered a memory access violation.',
      suggestions: [
        'For WebM format: Use VP9 codec with Opus audio (avoid AAC and x264 presets)',
        'For MP4 format: Use H.264 codec with AAC audio',
        'For OGG format: Use Opus or Vorbis audio codecs only',
        'Try using default settings without custom presets',
        'Check if the selected codec supports the chosen container format',
        'Verify that codec-container combinations are valid'
      ],
      originalError: errorString
    };
  }

  // Opus-specific errors
  if (errorString.includes('opus') || errorString.includes('libopus')) {
    console.error('🎵 DETECTED: Opus codec related error');
    return {
      type: 'codec_incompatible',
      message: 'Opus codec configuration error',
      details: 'The Opus codec configuration is incompatible with the current settings or FFmpeg.wasm build.',
      suggestions: [
        'Ensure Opus codec is used only with OGG or WebM containers',
        'Try using quality mode (-q:a) instead of bitrate mode for Opus',
        'Reduce bitrate to 128k or lower',
        'Check if FFmpeg.wasm build includes Opus support',
        'Try using Vorbis codec as alternative for OGG format'
      ],
      originalError: errorString
    };
  }

  // Vorbis-specific errors
  if (errorString.includes('vorbis') || errorString.includes('libvorbis')) {
    console.error('🎵 DETECTED: Vorbis codec related error');
    return {
      type: 'codec_incompatible',
      message: 'Vorbis codec configuration error',
      details: 'The Vorbis codec configuration is incompatible with the current settings.',
      suggestions: [
        'Ensure Vorbis codec is used only with OGG container',
        'Use quality mode (-q:a) for Vorbis instead of bitrate mode',
        'Try quality values between 3-7 for Vorbis',
        'Check sample rate compatibility (44100 or 48000 recommended)'
      ],
      originalError: errorString
    };
  }

  // Container format errors
  if (errorString.includes('Invalid data found when processing input') || errorString.includes('moov atom not found')) {
    console.error('📦 DETECTED: Input file corruption or format error');
    return {
      type: 'file_error',
      message: 'Input file appears to be corrupted or invalid',
      details: 'The input file cannot be read properly by FFmpeg. This could be due to file corruption, unsupported format, or incomplete upload.',
      suggestions: [
        'Try uploading a different file',
        'Ensure the file is not corrupted',
        'Check if the file format is supported',
        'Verify the file finished uploading completely',
        'Try converting the file to a more common format first'
      ],
      originalError: errorString
    };
  }

  // Memory and resource errors
  if (errorString.includes('No space left') || errorString.includes('Cannot allocate memory') || errorString.includes('out of memory')) {
    console.error('💾 DETECTED: Memory or storage limitation');
    return {
      type: 'memory_error',
      message: 'Insufficient memory or storage space',
      details: 'FFmpeg ran out of memory or storage space during processing. This can happen with large files or complex operations.',
      suggestions: [
        'Try compressing a smaller file first',
        'Reduce the output quality settings',
        'Lower the sample rate (e.g., 44100 instead of 48000)',
        'Use mono instead of stereo if acceptable',
        'Free up browser memory by closing other tabs',
        'Restart the browser if memory usage is high'
      ],
      originalError: errorString
    };
  }

  // Codec availability errors
  if (errorString.includes('Unknown encoder') || errorString.includes('Encoder not found') || errorString.includes('No such file or directory')) {
    console.error('🔧 DETECTED: Missing codec or encoder');
    return {
      type: 'codec_incompatible',
      message: 'Selected codec is not available',
      details: 'The requested encoder/codec is not available in this FFmpeg.wasm build.',
      suggestions: [
        'Try using a different codec (H.264 for video, AAC for audio)',
        'For audio: Use AAC instead of Opus/Vorbis if having issues',
        'Check the codec compatibility with your selected format',
        'Verify FFmpeg.wasm build includes the required codec',
        'Use libmp3lame for MP3 output'
      ],
      originalError: errorString
    };
  }

  // Parameter and argument errors
  if (errorString.includes('Invalid argument') || errorString.includes('Option not found') || errorString.includes('Unrecognized option')) {
    console.error('⚙️ DETECTED: Invalid FFmpeg parameter');
    return {
      type: 'format_unsupported',
      message: 'Invalid FFmpeg parameters',
      details: 'One or more compression parameters are invalid or unsupported by this FFmpeg.wasm build.',
      suggestions: [
        'Try using default settings first',
        'Remove advanced codec-specific options',
        'Check if the selected format supports the chosen options',
        'Verify parameter syntax is correct',
        'Use simpler codec configurations'
      ],
      originalError: errorString
    };
  }

  // Network or loading errors
  if (errorString.includes('Failed to fetch') || errorString.includes('NetworkError') || errorString.includes('AbortError')) {
    console.error('🌐 DETECTED: Network or loading error');
    return {
      type: 'file_error',
      message: 'Network or file loading error',
      details: 'Failed to load necessary resources or input file due to network issues.',
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Ensure the file uploaded completely',
        'Try a smaller file first',
        'Clear browser cache and try again'
      ],
      originalError: errorString
    };
  }

  // Threading or worker errors
  if (errorString.includes('Worker') || errorString.includes('SharedArrayBuffer')) {
    console.error('🧵 DETECTED: Worker or threading error');
    return {
      type: 'unknown',
      message: 'Browser threading or worker error',
      details: 'Error related to browser worker threads or SharedArrayBuffer support.',
      suggestions: [
        'Try reducing the number of threads',
        'Check if your browser supports SharedArrayBuffer',
        'Try using a different browser',
        'Disable browser extensions that might interfere',
        'Ensure the site is served over HTTPS'
      ],
      originalError: errorString
    };
  }

  // Default case for unknown errors
  console.error('❓ DETECTED: Unknown or unhandled error type');
  return {
    type: 'unknown',
    message: 'Compression failed with an unknown error',
    details: `FFmpeg encountered an unexpected error: ${errorMessage}. This might be due to an unsupported codec combination, file format issue, or FFmpeg.wasm limitation.`,
    suggestions: [
      'Try using different compression settings',
      'Try a different output format (MP3 for audio, MP4 for video)',
      'Use simpler codec configurations',
      'Check the browser console for more detailed error information',
      'Ensure your file is valid and not corrupted',
      'Try with a smaller test file first',
      'Refresh the page and try again'
    ],
    originalError: errorString
  };
}

/**
 * Logs detailed FFmpeg debugging information
 */
export function logFFmpegDebugInfo(args: string[], options: any, fileName: string) {
  console.group('🎬 FFmpeg Comprehensive Debug Information');
  console.log('📁 Input File:', fileName);
  console.log('⚙️ Raw Compression Options:', JSON.stringify(options, null, 2));
  console.log('🔧 Complete FFmpeg Arguments:', args);
  console.log('📦 Detected Output Format:', options.outputFormat || options.outputExtension || 'unknown');
  console.log('🎥 Video Codec:', options.vcodec || 'not specified');
  console.log('🔊 Audio Codec:', options.acodec || 'not specified');
  console.log('📊 Audio Bitrate:', options.bitrate || 'default');
  console.log('🎚️ Sample Rate:', options.sampleRate || 'default');
  console.log('🔈 Channels:', options.channels || 'default');
  console.log('🎛️ Custom Args:', options.customArgs || 'none');
  
  // Log system information
  console.group('💻 System Information');
  console.log('User Agent:', navigator.userAgent);
  console.log('Platform:', navigator.platform);
  console.log('Available Memory:', (navigator as any).deviceMemory || 'unknown');
  console.log('Hardware Concurrency:', navigator.hardwareConcurrency || 'unknown');
  console.groupEnd();

  // Check for potential compatibility issues
  const warnings = [];
  const errors = [];
  
  // Container-codec compatibility checks
  if (options.outputFormat === 'mp4' && (options.vcodec === 'libvpx' || options.vcodec === 'libvpx-vp9')) {
    errors.push('❌ CRITICAL: VP8/VP9 codecs are NOT compatible with MP4 container. Use WebM instead.');
  }
  
  if (options.outputFormat === 'webm' && (options.vcodec === 'libx264' || options.vcodec === 'libx265')) {
    warnings.push('⚠️ H.264/H.265 codecs are not recommended for WebM container. Use VP8/VP9 instead.');
  }
  
  if (options.outputFormat === 'webm' && options.acodec === 'aac') {
    errors.push('❌ CRITICAL: AAC codec is NOT compatible with WebM container. Use Opus or Vorbis instead.');
  }

  if (options.outputFormat === 'ogg' && (options.acodec === 'aac' || options.acodec === 'mp3' || options.acodec === 'libmp3lame')) {
    errors.push('❌ CRITICAL: AAC/MP3 codecs are NOT compatible with OGG container. Use Opus or Vorbis instead.');
  }

  if (options.outputFormat === 'mp3' && (options.acodec === 'opus' || options.acodec === 'libopus' || options.acodec === 'vorbis' || options.acodec === 'libvorbis')) {
    errors.push('❌ CRITICAL: Opus/Vorbis codecs cannot be used with MP3 format. Use libmp3lame codec instead.');
  }
  
  if (options.outputFormat === 'webm' && options.preset && options.vcodec?.includes('vp')) {
    warnings.push('⚠️ VP8/VP9 codecs do not use x264 presets. Consider removing preset or switching to speed parameter.');
  }

  // Audio-specific checks
  if ((options.acodec === 'opus' || options.acodec === 'libopus') && options.outputFormat !== 'ogg' && options.outputFormat !== 'webm') {
    errors.push('❌ CRITICAL: Opus codec requires OGG or WebM container format.');
  }

  if ((options.acodec === 'vorbis' || options.acodec === 'libvorbis') && options.outputFormat !== 'ogg') {
    errors.push('❌ CRITICAL: Vorbis codec requires OGG container format.');
  }

  // Threading checks
  const threadCount = args.find((arg, i) => args[i-1] === '-threads');
  if (threadCount && parseInt(threadCount) > navigator.hardwareConcurrency) {
    warnings.push(`⚠️ Thread count (${threadCount}) exceeds available CPU cores (${navigator.hardwareConcurrency}).`);
  }

  // Bitrate checks
  if (options.bitrate && !options.bitrate.match(/^\d+[kmg]?$/i)) {
    warnings.push(`⚠️ Unusual bitrate format: ${options.bitrate}. Expected format: 128k, 320k, etc.`);
  }

  // Sample rate checks
  if (options.sampleRate && !['8000', '16000', '22050', '44100', '48000', '96000'].includes(options.sampleRate)) {
    warnings.push(`⚠️ Uncommon sample rate: ${options.sampleRate}Hz. Common rates: 44100, 48000.`);
  }

  // FFmpeg.wasm specific checks
  if (options.acodec === 'libopus' || options.acodec === 'opus') {
    console.log('🔍 OPUS CODEC ANALYSIS:');
    console.log('  - Using libopus encoder');
    console.log('  - Target container:', options.outputFormat);
    console.log('  - Bitrate mode active:', args.includes('-b:a'));
    console.log('  - Quality mode active:', args.includes('-q:a'));
    console.log('  - Both modes active (PROBLEMATIC):', args.includes('-b:a') && args.includes('-q:a'));
  }

  if (options.acodec === 'libvorbis' || options.acodec === 'vorbis') {
    console.log('🔍 VORBIS CODEC ANALYSIS:');
    console.log('  - Using libvorbis encoder');
    console.log('  - Target container:', options.outputFormat);
    console.log('  - Quality mode preferred for Vorbis');
    console.log('  - Using quality mode:', args.includes('-q:a'));
  }

  // Log all warnings and errors
  if (errors.length > 0) {
    console.group('❌ CRITICAL ERRORS (WILL LIKELY FAIL)');
    errors.forEach(error => console.error(error));
    console.groupEnd();
  }

  if (warnings.length > 0) {
    console.group('⚠️ COMPATIBILITY WARNINGS');
    warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ No obvious compatibility issues detected');
  }
  
  console.groupEnd();
}

/**
 * Creates a user-friendly error message for the UI
 */
export function formatUserErrorMessage(error: FFmpegError): string {
  return `${error.message}\n\n${error.details}\n\nSuggestions:\n${error.suggestions.map(s => `• ${s}`).join('\n')}`;
}