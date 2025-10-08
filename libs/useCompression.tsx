"use client"
// hooks/useCompression.ts
import { useCallback, useState, useEffect } from 'react';
import { CompressionOptions } from '@/types';

// Lazy load FFmpeg to avoid issues with SSR and bundling
let FFmpeg: any = null;
let fetchFile: any = null;
let toBlobURL: any = null;

const loadFFmpegModules = async () => {
  if (!FFmpeg) {
    const [ffmpegModule, utilModule] = await Promise.all([
      import('@ffmpeg/ffmpeg'),
      import('@ffmpeg/util')
    ]);
    
    FFmpeg = ffmpegModule.FFmpeg;
    fetchFile = utilModule.fetchFile;
    toBlobURL = utilModule.toBlobURL;
  }
  
  return { FFmpeg, fetchFile, toBlobURL };
};

interface CompressionStats {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    timestamp: number;
}

export const useCompression = (defaultOptions: CompressionOptions = {}) => {
    // FFmpeg instance - we'll reuse it across compressions
    const [ffmpeg, setFFmpeg] = useState<any | null>(null);
    const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
    const [isFFmpegLoading, setIsFFmpegLoading] = useState(false);

    // UI state
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState<number | null>(null);
    const [compressionStats, setCompressionStats] = useState<CompressionStats[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Initialize FFmpeg once when the hook is first used
    const initializeFFmpeg = useCallback(async () => {
        if (ffmpeg && isFFmpegLoaded) return ffmpeg;

        setError(null);
        setIsFFmpegLoading(true);
        console.log('Starting FFmpeg initialization...');

        try {
            const { FFmpeg: FFmpegClass, fetchFile: fetchFileUtil, toBlobURL: toBlobURLUtil } = await loadFFmpegModules();
            const ffmpegInstance = new FFmpegClass();

            // Set up progress tracking
            ffmpegInstance.on('progress', ({ progress }: { progress: number }) => {
                setCompressionProgress(Math.round(progress * 100));
            });

            console.log('Loading FFmpeg WASM modules...');
            
            // Load FFmpeg with CDN URLs (this works in main thread)
            await ffmpegInstance.load({
                coreURL: await toBlobURLUtil(
                    'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
                    'text/javascript'
                ),
                wasmURL: await toBlobURLUtil(
                    'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
                    'application/wasm'
                ),
            });

            setFFmpeg(ffmpegInstance);
            setIsFFmpegLoaded(true);
            setIsFFmpegLoading(false);
            setError(null);

            console.log('FFmpeg loaded successfully');
            return ffmpegInstance;

        } catch (err) {
            const errorMessage = `Failed to load FFmpeg: ${err instanceof Error ? err.message : 'Unknown error'}`;
            console.error('FFmpeg initialization failed:', err);
            setError(errorMessage);
            setIsFFmpegLoaded(false);
            setIsFFmpegLoading(false);
            throw new Error(errorMessage);
        }
    }, []);

    // Manual initialization function that can be called from UI
    const manualInitialize = useCallback(async () => {
        if (isFFmpegLoaded || isFFmpegLoading) return;
        
        try {
            await initializeFFmpeg();
        } catch (err) {
            console.error('Manual initialization failed:', err);
        }
    }, [initializeFFmpeg, isFFmpegLoaded, isFFmpegLoading]);

    // Audio compression function - optimized for voice notes
    const compressAudio = useCallback(async (
        file: File,
        customOptions: CompressionOptions = {}
    ): Promise<Blob> => {
        setIsCompressing(true);
        setError(null);
        setCompressionProgress(0);

        try {
            const ffmpegInstance = await initializeFFmpeg();
            const { fetchFile: fetchFileUtil } = await loadFFmpegModules();

            // Merge options with smart defaults
            const options = {
                ...getSmartDefaults(file, 'audio'),
                ...defaultOptions,
                ...customOptions
            };

            const inputFileName = `input_${Date.now()}.${getFileExtension(file.name)}`;
            const outputFormat = options.outputFormat || 'mp3';
            const outputFileName = `output_${Date.now()}.${outputFormat}`;

            // Write input file to FFmpeg's virtual file system
            await ffmpegInstance.writeFile(inputFileName, await fetchFileUtil(file));

            // Build compression arguments dynamically
            let args = ['-i', inputFileName];

            // Use custom args if provided, otherwise build from options
            if (options.customArgs && options.customArgs.length > 0) {
                args = args.concat(options.customArgs);
                args.push(outputFileName);
            } else {
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

                // Audio filters for voice optimization (only if not using custom args)
                args.push('-af', 'highpass=f=80,lowpass=f=8000,volume=1.2');
                
                // Quality setting for smaller size
                args.push('-q:a', '9');
                args.push(outputFileName);
            }

            console.log('Audio compression args:', args);
            await ffmpegInstance.exec(args);

            // Read the compressed file
            const compressedData = await ffmpegInstance.readFile(outputFileName);
            const mimeType = outputFormat === 'mp3' ? 'audio/mp3' : 
                           outputFormat === 'ogg' ? 'audio/ogg' : 
                           outputFormat === 'wav' ? 'audio/wav' : 'audio/aac';
            const compressedBlob = new Blob([compressedData], { type: mimeType });

            // Calculate compression stats
            const originalSize = file.size;
            const compressedSize = compressedBlob.size;
            const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

            const stats: CompressionStats = {
                originalSize,
                compressedSize,
                compressionRatio,
                timestamp: Date.now()
            };

            setCompressionStats(prev => [...prev, stats]);

            // Cleanup virtual files
            await ffmpegInstance.deleteFile(inputFileName);
            await ffmpegInstance.deleteFile(outputFileName);

            console.log(`Audio compression complete: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${compressionRatio.toFixed(1)}% smaller)`);

            return compressedBlob;

        } catch (err) {
            const errorMessage = `Audio compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsCompressing(false);
            setCompressionProgress(null);
        }
    }, [initializeFFmpeg, defaultOptions]);

    // Video compression function
    const compressVideo = useCallback(async (
        file: File,
        customOptions: CompressionOptions = {}
    ): Promise<Blob> => {
        setIsCompressing(true);
        setError(null);
        setCompressionProgress(0);
        console.log('Compressing Video');
        try {
            const ffmpegInstance = await initializeFFmpeg();
            const { fetchFile: fetchFileUtil } = await loadFFmpegModules();

            const options = {
                ...getSmartDefaults(file, 'video'),
                ...defaultOptions,
                ...customOptions
            };

            const inputFileName = `input_${Date.now()}.${getFileExtension(file.name)}`;
            const outputFormat = options.outputFormat || 'mp4';
            const outputFileName = `output_${Date.now()}.${outputFormat}`;

            await ffmpegInstance.writeFile(inputFileName, await fetchFileUtil(file));

            // Build args dynamically from options
            let args = ['-i', inputFileName];

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
            }

            console.log('Video compression args:', args);

            await ffmpegInstance.exec(args);

            const compressedData = await ffmpegInstance.readFile(outputFileName);
            const mimeType = outputFormat === 'webm' ? 'video/webm' : 
                           outputFormat === 'mkv' ? 'video/x-matroska' : 'video/mp4';
            const compressedBlob = new Blob([compressedData], { type: mimeType });

            // Stats tracking
            const originalSize = file.size;
            const compressedSize = compressedBlob.size;
            const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
            console.log(`Video compression complete: ${formatFileSize(file.size)} → ${formatFileSize(compressedBlob.size)} (${compressionRatio.toFixed(1)}% smaller)`);
            setCompressionStats(prev => [...prev, {
                originalSize,
                compressedSize,
                compressionRatio,
                timestamp: Date.now()
            }]);

            // Cleanup
            await ffmpegInstance.deleteFile(inputFileName);
            await ffmpegInstance.deleteFile(outputFileName);

            return compressedBlob;

        } catch (err) {
            const errorMessage = `Video compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsCompressing(false);
            setCompressionProgress(null);
        }
    }, [initializeFFmpeg, defaultOptions]);

    // Image compression (can use Canvas API - much faster than FFmpeg for images)
    const compressImage = useCallback(async (
        file: File,
        customOptions: CompressionOptions = {}
    ): Promise<Blob> => {
        setIsCompressing(true);
        setError(null);
        try {
            const options = {
                maxWidth: 1920,
                maxHeight: 1920,
                imageQuality: 0.8,
                outputFormat: 'jpeg',
                ...defaultOptions,
                ...customOptions
            };

            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                img.onload = () => {
                    // Calculate new dimensions maintaining aspect ratio
                    const { width, height } = calculateNewDimensions(
                        img.width,
                        img.height,
                        options.maxWidth!,
                        options.maxHeight!
                    );

                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress
                    ctx?.drawImage(img, 0, 0, width, height);

                    const outputType = options.outputFormat === 'png' ? 'image/png' : 'image/jpeg';
                    const quality = options.imageQuality || 0.8;

                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Track stats
                            const compressionRatio = ((file.size - blob.size) / file.size) * 100;
                            setCompressionStats(prev => [...prev, {
                                originalSize: file.size,
                                compressedSize: blob.size,
                                compressionRatio,
                                timestamp: Date.now()
                            }]);
                            console.log(`Image compression complete: ${formatFileSize(file.size)} → ${formatFileSize(blob.size)} (${compressionRatio.toFixed(1)}% smaller)`);
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    }, outputType, quality);
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = URL.createObjectURL(file);
            });

        } catch (err) {
            const errorMessage = `Image compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsCompressing(false);
        }
    }, [defaultOptions]);

    // Helper functions
    const getSmartDefaults = (file: File, type: string): CompressionOptions => {
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

            default:
                return {};
        }
    };

    const getFileExtension = (filename: string): string => {
        return filename.split('.').pop()?.toLowerCase() || 'bin';
    };

    const formatFileSize = (bytes: number): string => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)}MB`;
    };

    const calculateNewDimensions = (
        originalWidth: number,
        originalHeight: number,
        maxWidth: number,
        maxHeight: number
    ) => {
        const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
        return {
            width: Math.round(originalWidth * ratio),
            height: Math.round(originalHeight * ratio)
        };
    };

    // Cleanup FFmpeg on unmount
    useEffect(() => {
        return () => {
            // FFmpeg cleanup is handled automatically by the library
        };
    }, []);

    return {
        // Main compression functions
        compressAudio,
        compressVideo,
        compressImage,

        // UI state
        isCompressing,
        compressionProgress,
        compressionStats,
        error,
        isFFmpegLoaded,
        isFFmpegLoading,

        // Manual initialization
        manualInitialize,

        // Utility functions
        clearError: () => setError(null),
        getLatestStats: () => compressionStats[compressionStats.length - 1] || null,
        getTotalCompressions: () => compressionStats.length,
        getAverageCompressionRatio: () => {
            if (compressionStats.length === 0) return 0;
            const total: number = compressionStats.reduce((sum: number, stat: CompressionStats) => sum + stat.compressionRatio, 0);
            return total / compressionStats.length;
        }
    };
};