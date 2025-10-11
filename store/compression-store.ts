import { create } from 'zustand';
import { AudioCompressionOptions, CompressionStats, ImageCompressionOptions, PdfCompressionOptions, VideoCompressionOptions } from '@/types';

interface CompressionStore {
  // State
  isCompressing: boolean;
  isProcessingAll: boolean;
  compressionProgress: number | null;
  currentProcessingFile: string | null;
  error: string | null;
  compressionStats: CompressionStats[];
  audioOptions: AudioCompressionOptions;
  videoOptions: VideoCompressionOptions;
  imageOptions: ImageCompressionOptions;
  pdfOptions: PdfCompressionOptions;

  // FFmpeg state
  isFFmpegLoaded: boolean;
  isFFmpegLoading: boolean;
  
  // Actions
  setIsCompressing: (isCompressing: boolean) => void;
  setIsProcessingAll: (isProcessingAll: boolean) => void;
  setCompressionProgress: (progress: number | null) => void;
  setCurrentProcessingFile: (filename: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  addCompressionStats: (stats: CompressionStats) => void;
  setFFmpegLoaded: (loaded: boolean) => void;
  setFFmpegLoading: (loading: boolean) => void;
  setAudioOptions: (options: AudioCompressionOptions) => void;
  setVideoOptions: (options: VideoCompressionOptions) => void;
  setImageOptions: (options: ImageCompressionOptions) => void;
  setPdfOptions: (options: PdfCompressionOptions) => void;
  
  // Getters
  getLatestStats: () => CompressionStats | null;
  getTotalCompressions: () => number;
  getAverageCompressionRatio: () => number;
}

export const useCompressionStore = create<CompressionStore>((set, get) => ({
  // State
  isCompressing: false,
  isProcessingAll: false,
  compressionProgress: null,
  currentProcessingFile: null,
  error: null,
  compressionStats: [],
  audioOptions: {
    bitrate: '128k',
    sampleRate: '44100',
    channels: 2,
    acodec: 'aac',
  },
  videoOptions: {
    bitrate: '1000k',
    preset: 'ultrafast',
    crf: 23,
    scale: '1280:-1',
    sampleRate: '128k',
    vcodec: 'libx264',
  },
  imageOptions: {
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
  },
  pdfOptions: {
    pdfQuality: 'screen',
    pdfCompatibility: '1.4',
    grayscale: false,
    optimizeImages: true,
    linearize: false,
    removeMetadata: true,
  },

  // FFmpeg state
  isFFmpegLoaded: false,
  isFFmpegLoading: false,
  
  // Actions
  setAudioOptions: (options) => set({ audioOptions: options }),
  setVideoOptions: (options) => set({ videoOptions: options }),
  setImageOptions: (options) => set({ imageOptions: options }),
  setPdfOptions: (options) => set({ pdfOptions: options }),
  setIsCompressing: (isCompressing) => set({ isCompressing }),
  setIsProcessingAll: (isProcessingAll) => set({ isProcessingAll }),
  setCompressionProgress: (progress) => set({ compressionProgress: progress }),
  setCurrentProcessingFile: (filename) => set({ currentProcessingFile: filename }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  addCompressionStats: (stats) => 
    set(state => ({ 
      compressionStats: [...state.compressionStats, stats] 
    })),
  setFFmpegLoaded: (loaded) => set({ isFFmpegLoaded: loaded }),
  setFFmpegLoading: (loading) => set({ isFFmpegLoading: loading }),
  
  // Getters
  getLatestStats: () => {
    const stats = get().compressionStats;
    return stats.length > 0 ? stats[stats.length - 1] : null;
  },
  
  getTotalCompressions: () => get().compressionStats.length,
  
  getAverageCompressionRatio: () => {
    const stats = get().compressionStats;
    if (stats.length === 0) return 0;
    
    const total = stats.reduce((sum, stat) => sum + stat.compressionRatio, 0);
    return total / stats.length;
  },
}));