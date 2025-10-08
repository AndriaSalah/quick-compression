import { useCallback } from 'react';
import { toast } from 'sonner';
import { useFileStore } from '@/store/file-store';
import { useCompressionStore } from '@/store/compression-store';
import { useSettingsStore } from '@/store/settings-store';
import { useCompression } from '@/libs/useCompression';
import { formatFileSize } from '@/utils/components/file-list-results';
import { FileResult } from '@/types';

export const useFileCompression = () => {
  const { 
    updateFileResult,
    getPendingFiles
  } = useFileStore();
  
  const {
    setIsCompressing,
    setIsProcessingAll,
    setCurrentProcessingFile,
    setError,
    clearError,
    addCompressionStats,
    isFFmpegLoaded
  } = useCompressionStore();
  
  const { compressionOptions } = useSettingsStore();
  
  const { compressImage, compressVideo, compressAudio } = useCompression(compressionOptions);

  const compressFile = useCallback(async (fileResult: FileResult) => {
    setCurrentProcessingFile(fileResult.originalFile.name);
    
    // Update status to compressing
    updateFileResult(fileResult.id, { status: 'compressing' });

    try {
      // Auto-initialize FFmpeg if not loaded for video/audio
      if (!isFFmpegLoaded && (
        fileResult.originalFile.type.startsWith('video/') || 
        fileResult.originalFile.type.startsWith('audio/')
      )) {
        toast.info('Initializing compression engine...', {
          description: 'Downloading WebAssembly modules (this may take a moment)'
        });
      }

      let compressedBlob: Blob;
      const file = fileResult.originalFile;

      if (file.type.startsWith('image/')) {
        compressedBlob = await compressImage(file, compressionOptions);
      } else if (file.type.startsWith('video/')) {
        compressedBlob = await compressVideo(file, compressionOptions);
      } else if (file.type.startsWith('audio/')) {
        compressedBlob = await compressAudio(file, compressionOptions);
      } else {
        throw new Error('Unsupported file type');
      }

      const compressionRatio = ((file.size - compressedBlob.size) / file.size) * 100;
      const stats = {
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        compressionRatio,
        timestamp: Date.now()
      };

      // Show success toast
      toast.success(`Successfully compressed ${file.name}`, {
        description: `Reduced by ${compressionRatio.toFixed(1)}% (${formatFileSize(file.size)} → ${formatFileSize(compressedBlob.size)})`
      });

      // Update with success
      updateFileResult(fileResult.id, {
        status: 'completed',
        compressedBlob,
        compressedSize: compressedBlob.size,
        compressionRatio,
        timestamp: Date.now()
      });

      // Add to stats
      addCompressionStats(stats);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Compression failed';
      
      // Show error toast
      toast.error(`Failed to compress ${fileResult.originalFile.name}`, {
        description: errorMessage
      });

      // Update with error
      updateFileResult(fileResult.id, {
        status: 'error',
        error: errorMessage
      });
    } finally {
      setCurrentProcessingFile(null);
    }
  }, [
    updateFileResult, 
    setCurrentProcessingFile, 
    isFFmpegLoaded,
    compressionOptions,
    compressImage,
    compressVideo,
    compressAudio,
    addCompressionStats
  ]);

  const compressAllFiles = useCallback(async () => {
    setIsProcessingAll(true);
    clearError();

    const pendingFiles = getPendingFiles();
    
    for (const fileResult of pendingFiles) {
      await compressFile(fileResult);
    }
    
    setIsProcessingAll(false);
  }, [compressFile, getPendingFiles, setIsProcessingAll, clearError]);

  return {
    compressFile,
    compressAllFiles,
  };
};