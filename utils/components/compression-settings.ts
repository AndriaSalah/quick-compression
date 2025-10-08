/**
 * Utility functions for CompressionSettings component
 */

export interface SmartDefaults {
  [key: string]: any;
}

export const getSmartDefaults = (file: File, type: string): SmartDefaults => {
  const fileSizeMB = file.size / (1024 * 1024);

  switch (type) {
    case 'audio':
      // For voice notes, be very aggressive with compression
      return {
        bitrate: fileSizeMB > 10 ? '24k' : fileSizeMB > 5 ? '28k' : '32k',
        sampleRate: '16000', // Perfect for speech
        channels: 1 // Mono for voice
      };

    case 'video':
      return {
        maxWidth: fileSizeMB > 100 ? 480 : fileSizeMB > 50 ? 720 : 1080,
        crf: fileSizeMB > 100 ? 32 : 28,
        preset: 'fast'
      };

    case 'image':
      return {
        maxWidth: fileSizeMB > 10 ? 1280 : 1920,
        maxHeight: fileSizeMB > 10 ? 1280 : 1920,
        imageQuality: fileSizeMB > 5 ? 0.7 : 0.8
      };

    default:
      return {};
  }
};

export const detectFileTypes = (files: File[]): {
  hasImages: boolean;
  hasVideos: boolean;
  hasAudio: boolean;
} => {
  return {
    hasImages: files.some(file => file.type.startsWith('image/')),
    hasVideos: files.some(file => file.type.startsWith('video/')),
    hasAudio: files.some(file => file.type.startsWith('audio/'))
  };
};

export const mergeCompressionOptions = (
  defaultOptions: any,
  currentOptions: any,
  customOptions: any
): any => {
  return {
    ...defaultOptions,
    ...currentOptions,
    ...customOptions
  };
};