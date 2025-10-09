import { useCallback } from 'react';
import { useCompressionStore } from '@/store/compression-store';
import { useCompression } from '@/lib/useCompression';

export const useFFmpegEngine = () => {
  const {
    isFFmpegLoaded,
    isFFmpegLoading,
    setFFmpegLoaded,
    setFFmpegLoading,
    setError,
    clearError
  } = useCompressionStore();

  const { manualInitialize } = useCompression();

  const initializeEngine = useCallback(async () => {
    if (isFFmpegLoaded || isFFmpegLoading) return;
    
    try {
      clearError();
      setFFmpegLoading(true);
      await manualInitialize();
      setFFmpegLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize compression engine';
      setError(errorMessage);
      throw err;
    } finally {
      setFFmpegLoading(false);
    }
  }, [isFFmpegLoaded, isFFmpegLoading, manualInitialize, setFFmpegLoaded, setFFmpegLoading, setError, clearError]);

  return {
    isFFmpegLoaded,
    isFFmpegLoading,
    initializeEngine,
  };
};