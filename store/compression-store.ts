import { create } from 'zustand';
import { CompressionStats } from '@/types';

interface CompressionStore {
  // State
  isCompressing: boolean;
  isProcessingAll: boolean;
  compressionProgress: number | null;
  currentProcessingFile: string | null;
  error: string | null;
  compressionStats: CompressionStats[];
  
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
  
  // FFmpeg state
  isFFmpegLoaded: false,
  isFFmpegLoading: false,
  
  // Actions
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