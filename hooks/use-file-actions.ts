import { useCallback } from 'react';
import { toast } from 'sonner';
import { useFileStore } from '@/store/file-store';
import { downloadBlob, generateFileName } from '@/utils/components/file-list-results';

export const useFileActions = () => {
  const { 
    removeFile, 
    updateFileResult, 
    clearAllFiles,
    getCompletedFiles
  } = useFileStore();

  const handleRemoveFile = useCallback((id: string) => {
    removeFile(id);
  }, [removeFile]);

  const handleRetryFile = useCallback((id: string) => {
    updateFileResult(id, { 
      status: 'pending', 
      error: undefined 
    });
  }, [updateFileResult]);

  const handleDownloadFile = useCallback((id: string, fileResults: any[]) => {
    const fileResult = fileResults.find(f => f.id === id);
    if (!fileResult?.compressedBlob) return;

    const filename = generateFileName(fileResult.originalFile.name, 'compressed');
    downloadBlob(fileResult.compressedBlob, filename);

    // Show success toast
    toast.success('Download started', {
      description: filename
    });
  }, []);

  const handleDownloadAll = useCallback(() => {
    const completedFiles = getCompletedFiles();
    
    if (completedFiles.length === 0) {
      toast.error('No completed files to download');
      return;
    }

    completedFiles.forEach(fileResult => {
      if (fileResult.compressedBlob) {
        const filename = generateFileName(fileResult.originalFile.name, 'compressed');
        downloadBlob(fileResult.compressedBlob, filename);
      }
    });

    toast.success(`Downloaded ${completedFiles.length} files`);
  }, [getCompletedFiles]);

  const handleClearAll = useCallback(() => {
    clearAllFiles();
    toast.info('All files cleared');
  }, [clearAllFiles]);

  return {
    handleRemoveFile,
    handleRetryFile,
    handleDownloadFile,
    handleDownloadAll,
    handleClearAll,
  };
};