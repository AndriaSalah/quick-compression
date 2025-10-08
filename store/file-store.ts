import { create } from 'zustand';
import { FileResult, CompressionOptions, CompressionStats } from '@/types';

interface FileStore {
  // File management
  selectedFiles: File[];
  fileResults: FileResult[];
  
  // Actions
  setSelectedFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  removeFileByObject: (file: File) => void;
  updateFileResult: (id: string, updates: Partial<FileResult>) => void;
  clearAllFiles: () => void;
  
  // Getters
  getPendingFiles: () => FileResult[];
  getCompletedFiles: () => FileResult[];
  getProcessingFiles: () => FileResult[];
  getErrorFiles: () => FileResult[];
}

export const useFileStore = create<FileStore>((set, get) => ({
  selectedFiles: [],
  fileResults: [],
  
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  
  addFiles: (files) => {
    const newFileResults: FileResult[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalFile: file,
      status: 'pending' as const,
      originalSize: file.size,
    }));
    
    set(state => ({
      selectedFiles: [...state.selectedFiles, ...files],
      fileResults: [...state.fileResults, ...newFileResults]
    }));
  },
  
  removeFile: (id) => {
    const fileResult = get().fileResults.find(f => f.id === id);
    if (!fileResult) return;
    
    set(state => ({
      selectedFiles: state.selectedFiles.filter(f => f !== fileResult.originalFile),
      fileResults: state.fileResults.filter(f => f.id !== id)
    }));
  },
  
  removeFileByObject: (file) => {
    set(state => ({
      selectedFiles: state.selectedFiles.filter(f => f !== file),
      fileResults: state.fileResults.filter(f => f.originalFile !== file)
    }));
  },
  
  updateFileResult: (id, updates) => {
    set(state => ({
      fileResults: state.fileResults.map(f => 
        f.id === id ? { ...f, ...updates } : f
      )
    }));
  },
  
  clearAllFiles: () => set({ selectedFiles: [], fileResults: [] }),
  
  // Getters
  getPendingFiles: () => get().fileResults.filter(f => f.status === 'pending'),
  getCompletedFiles: () => get().fileResults.filter(f => f.status === 'completed'),
  getProcessingFiles: () => get().fileResults.filter(f => f.status === 'compressing'),
  getErrorFiles: () => get().fileResults.filter(f => f.status === 'error'),
}));