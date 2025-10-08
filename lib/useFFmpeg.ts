"use client";

import { useState, useCallback, useEffect, useRef } from 'react';

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

// Global FFmpeg instance and state to share across all hooks
let globalFFmpegInstance: any = null;
let globalFFmpegLoaded = false;
let globalFFmpegLoading = false;
let globalError: string | null = null;
let globalCompressionProgress: number | null = null;

// Listeners for state changes
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const setGlobalCompressionProgress = (progress: number | null) => {
  globalCompressionProgress = progress;
  notifyListeners();
};

const setGlobalError = (error: string | null) => {
  globalError = error;
  notifyListeners();
};

const setGlobalFFmpegState = (instance: any, loaded: boolean, loading: boolean) => {
  globalFFmpegInstance = instance;
  globalFFmpegLoaded = loaded;
  globalFFmpegLoading = loading;
  notifyListeners();
};

export const useFFmpeg = () => {
  // Local state that will be updated when global state changes
  const [ffmpeg, setFFmpeg] = useState(globalFFmpegInstance);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(globalFFmpegLoaded);
  const [isFFmpegLoading, setIsFFmpegLoading] = useState(globalFFmpegLoading);
  const [error, setError] = useState(globalError);
  const [compressionProgress, setCompressionProgress] = useState(globalCompressionProgress);

  // Subscribe to global state changes
  useEffect(() => {
    const updateState = () => {
      setFFmpeg(globalFFmpegInstance);
      setIsFFmpegLoaded(globalFFmpegLoaded);
      setIsFFmpegLoading(globalFFmpegLoading);
      setError(globalError);
      setCompressionProgress(globalCompressionProgress);
    };

    listeners.add(updateState);
    
    return () => {
      listeners.delete(updateState);
    };
  }, []);

  // Initialize FFmpeg once when the hook is first used
  const initializeFFmpeg = useCallback(async () => {
    if (globalFFmpegInstance && globalFFmpegLoaded) return globalFFmpegInstance;

    setGlobalError(null);
    setGlobalFFmpegState(globalFFmpegInstance, false, true);
    console.log('Starting FFmpeg initialization...');

    try {
      const { FFmpeg: FFmpegClass } = await loadFFmpegModules();
      const ffmpegInstance = new FFmpegClass();

      // Set up progress tracking
      ffmpegInstance.on('progress', ({ progress }: { progress: number }) => {
        console.log('FFmpeg progress:', Math.round(progress * 100));
        setGlobalCompressionProgress(Math.round(progress * 100));
      });

      console.log('Loading FFmpeg WASM modules...');
      // Load FFmpeg with CDN URLs (this works in main thread)
      await ffmpegInstance.load({
        coreURL: await toBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
          'text/javascript'
        ),
        wasmURL: await toBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
          'application/wasm'
        ),
      });

      setGlobalFFmpegState(ffmpegInstance, true, false);
      setGlobalError(null);

      console.log('FFmpeg loaded successfully');
      return ffmpegInstance;

    } catch (err) {
      const errorMessage = `Failed to load FFmpeg: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error('FFmpeg initialization failed:', err);
      setGlobalError(errorMessage);
      setGlobalFFmpegState(null, false, false);
      throw new Error(errorMessage);
    }
  }, []);

  // Manual initialization function that can be called from UI
  const manualInitialize = useCallback(async () => {
    if (globalFFmpegLoaded || globalFFmpegLoading) return;
    
    try {
      await initializeFFmpeg();
    } catch (err) {
      console.error('Manual initialization failed:', err);
    }
  }, [initializeFFmpeg]);

  // Get FFmpeg utilities
  const getFFmpegUtils = useCallback(async () => {
    return await loadFFmpegModules();
  }, []);

  // Cleanup FFmpeg on unmount
  useEffect(() => {
    return () => {
      // FFmpeg cleanup is handled automatically by the library
    };
  }, []);

  return {
    // FFmpeg instance and state
    ffmpeg,
    isFFmpegLoaded,
    isFFmpegLoading,
    error,
    compressionProgress,
    
    // Actions
    initializeFFmpeg,
    manualInitialize,
    getFFmpegUtils,
    clearError: () => setGlobalError(null),
    setCompressionProgress: setGlobalCompressionProgress
  };
};