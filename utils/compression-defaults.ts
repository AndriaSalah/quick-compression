import { CompressionOptions } from '@/types';

/**
 * Generates smart default compression options based on file type and size
 * @param file - The file to get defaults for
 * @param type - The media type ('audio', 'video', 'image', 'pdf')
 * @returns Optimized compression options
 */
export function getSmartDefaults(file: File, type: string): CompressionOptions {
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
        quality: fileSizeMB > 100 ? 32 : 28,
        preset: 'fast'
      };

    case 'image':
      return {
        maxWidth: fileSizeMB > 10 ? 1280 : 1920,
        maxHeight: fileSizeMB > 10 ? 1280 : 1920,
        quality: fileSizeMB > 5 ? 0.7 : 0.8
      };

    case 'pdf':
      // More aggressive PDF compression defaults based on file size
      return {
        pdfQuality: fileSizeMB > 50 ? 'screen' : fileSizeMB > 20 ? 'ebook' : fileSizeMB > 5 ? 'printer' : 'printer',
        pdfCompatibility: '1.4', // Maximum compatibility
        optimizeImages: true,
        linearize: true, // Optimize for web viewing
        removeMetadata: true // Always remove metadata for compression
      };

    default:
      return {};
  }
}