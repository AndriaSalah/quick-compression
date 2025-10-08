"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  Zap, 
  Shield, 
  Globe, 
  Github,
  Play,
  Pause,
  RotateCcw,
  Download,
  Loader2,
  CheckCircle2,
  Clock
} from 'lucide-react';

import { FileDropZone } from '@/components/FileDropZone';
import { CompressionSettings } from '@/components/CompressionSettings';
import { ProgressDisplay } from '@/components/ProgressDisplay';
import { FileListResults } from '@/components/FileListResults';
import { useCompression } from '@/lib/useCompression';

// Store imports
import { useFileStore } from '@/store/file-store';

// Types imports
import { CompressionOptions, FileResult } from '@/types';

// Utils imports
import { formatFileSize } from '@/utils/file-size-formatter';
import { generateFileName } from '@/utils/file-name-generator';
import { downloadSingleFile, downloadMultipleFiles, getDownloadableFiles } from '@/utils/download-helper';
import { calculateCompressionRatio, getCompressionType, formatCompressionSuccess, processCompressionResult } from '@/utils/file-compression';

export default function HomePage() {
  // Use file store instead of local state
  const {
    selectedFiles,
    fileResults,
    addFiles,
    removeFile,
    removeFileByObject,
    updateFileResult,
    clearAllFiles,
    getPendingFiles,
    getCompletedFiles
  } = useFileStore();
  
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    quality: 0.8,
    imageQuality: 0.7, // Default to "Web" preset (matches maxWidth/maxHeight)
    maxWidth: 1920,
    maxHeight: 1920,
    bitrate: '128k',
    sampleRate: '44100',
    channels: 2,
    preset: 'fast'
  });
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [currentProcessingFile, setCurrentProcessingFile] = useState<string | null>(null);

  const {
    compressAudio,
    compressVideo,
    compressImage,
    compressPdf,
    isCompressing,
    compressionProgress,
    compressionStats,
    error,
    isFFmpegLoaded,
    isFFmpegLoading,
    manualInitialize,
    clearError
  } = useCompression(compressionOptions);

  // Utility function for formatting file sizes
  // Now imported from utils/file-size-formatter.ts

  const handleFilesSelected = useCallback((files: File[]) => {
    addFiles(files);
    
    // Show info toast
    toast.info(`Added ${files.length} file${files.length > 1 ? 's' : ''}`, {
      description: `Total: ${selectedFiles.length + files.length} files ready for compression`
    });
  }, [selectedFiles]);

  const compressFile = async (fileResult: FileResult) => {
    setCurrentProcessingFile(fileResult.originalFile.name);
    
    // Update status to compressing
    updateFileResult(fileResult.id, { status: 'compressing' });

    try {
      // Auto-initialize FFmpeg if not loaded
      if (!isFFmpegLoaded) {
        toast.info('Initializing compression engine...', {
          description: 'Downloading WebAssembly modules (this may take a moment)'
        });
      }

      const file = fileResult.originalFile;
      const compressionType = getCompressionType(file);
      if (!compressionType) {
        throw new Error('Unsupported file type');
      }

      let compressedBlob: Blob;

      if (compressionType === 'image') {
        compressedBlob = await compressImage(file, compressionOptions);
      } else if (compressionType === 'video') {
        compressedBlob = await compressVideo(file, compressionOptions);
      } else if (compressionType === 'audio') {
        compressedBlob = await compressAudio(file, compressionOptions);
      } else if (compressionType === 'pdf') {
        compressedBlob = await compressPdf(file, compressionOptions);
      } else {
        throw new Error('Unsupported file type');
      }

      const result = processCompressionResult(file, compressedBlob);
      const successMessage = formatCompressionSuccess(file.name, result.originalSize, result.compressedSize);

      // Show success toast
      toast.success(successMessage.title, {
        description: successMessage.description
      });

      // Update with success
      updateFileResult(fileResult.id, {
        status: 'completed' as const,
        compressedBlob: result.compressedBlob,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        timestamp: Date.now()
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Compression failed';
      
      // Show error toast
      toast.error(`Failed to compress ${fileResult.originalFile.name}`, {
        description: errorMessage
      });

      // Update with error
      updateFileResult(fileResult.id, {
        status: 'error' as const,
        error: err instanceof Error ? err.message : 'Compression failed'
      });
    } finally {
      setCurrentProcessingFile(null);
    }
  };

  const handleCompressFile = async (id: string) => {
    const fileResult = fileResults.find(f => f.id === id);
    if (!fileResult) return;
    
    await compressFile(fileResult);
  };

  const handleCompressAll = async () => {
    setIsProcessingAll(true);
    clearError();

    const pendingFiles = getPendingFiles();
    
    for (const fileResult of pendingFiles) {
      await compressFile(fileResult);
    }
    
    setIsProcessingAll(false);
  };

  const handleRetryFile = async (id: string) => {
    updateFileResult(id, { status: 'pending', error: undefined });
    await handleCompressFile(id);
  };

  const handleRecompressFile = async (id: string) => {
    updateFileResult(id, {
      status: 'pending',
      error: undefined,
      compressedBlob: undefined,
      compressedSize: undefined,
      compressionRatio: undefined,
      timestamp: undefined
    });
    await handleCompressFile(id);
  };

  const handleRemoveFile = (id: string) => {
    removeFile(id);
  };

  const handleDownloadFile = (id: string) => {
    const fileResult = fileResults.find(f => f.id === id);
    if (!fileResult?.compressedBlob) return;

    downloadSingleFile(fileResult.compressedBlob, fileResult.originalFile.name, 'compressed');

    // Show success toast
    const fileName = generateFileName(fileResult.originalFile.name, 'compressed');
    toast.success('Download started', {
      description: fileName
    });
  };

  const handleDownloadAll = () => {
    const completedFiles = getDownloadableFiles(fileResults);
    
    if (completedFiles.length === 0) {
      toast.warning('No completed files to download');
      return;
    }
    
    downloadMultipleFiles(completedFiles, 'compressed');

    // Show success toast
    toast.success(`Downloaded ${completedFiles.length} file${completedFiles.length > 1 ? 's' : ''}`, {
      description: 'All compressed files downloaded successfully'
    });
  };

  // generateFileName function moved to utils/file-name-generator.ts

  // Use store getters for file filtering
  const pendingFiles = getPendingFiles();
  const completedFiles = getCompletedFiles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quick Compression</h1>
                <p className="text-sm text-gray-600">Compress images, videos & audio files instantly</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Privacy First</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>No Upload</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Upload & Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hero Section */}
            <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">
                  Compress Files Instantly
                </h2>
                <p className="text-blue-100 mb-6 text-lg">
                  Reduce file sizes by up to 90% without losing quality. 
                  All processing happens in your browser - no uploads required.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    ✨ Client-side Processing
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    🔒 100% Private
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    ⚡ Lightning Fast
                  </Badge>
                </div>

                {/* Engine Status in Hero */}
                <div className="flex items-center space-x-4">
                  {isFFmpegLoading && (
                    <div className="flex items-center space-x-3 text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading compression engine...</span>
                    </div>
                  )}

                  {isFFmpegLoaded && (
                    <div className="flex items-center space-x-3 text-white">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Compression engine ready!</span>
                    </div>
                  )}

                  {!isFFmpegLoaded && !isFFmpegLoading && (
                    <div className="flex items-center space-x-3 text-white/80">
                      <Clock className="w-5 h-5" />
                      <span>Engine will auto-download for video/audio compression</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <FileDropZone
              onFilesSelected={handleFilesSelected}
              onRemoveFile={removeFileByObject}
              selectedFiles={selectedFiles}
              isProcessing={isCompressing || isProcessingAll}
            />

            {/* Compression Settings */}
            <CompressionSettings
              options={compressionOptions}
              onOptionsChange={setCompressionOptions}
              selectedFiles={selectedFiles}
            />
          </div>

          {/* Right Column - Progress & Results */}
          <div className="space-y-6">
            
            {/* Progress Display */}
            <ProgressDisplay
              isCompressing={isCompressing || isProcessingAll}
              compressionProgress={compressionProgress}
              compressionStats={compressionStats}
              error={error}
              currentFile={currentProcessingFile || undefined}
              isFFmpegLoaded={isFFmpegLoaded}
              isFFmpegLoading={isFFmpegLoading}
            />

            <Separator />

            {/* File Results */}
            <FileListResults
              files={fileResults}
              onRemoveFile={handleRemoveFile}
              onRetryFile={handleRetryFile}
              onRecompressFile={handleRecompressFile}
              onCompressFile={handleCompressFile}
              onDownloadFile={handleDownloadFile}
              onDownloadAll={handleDownloadAll}
              onCompressAll={handleCompressAll}
              onClearAll={() => {
                clearAllFiles();
                clearError();
                toast.info('All files cleared');
              }}
              isProcessing={isCompressing || isProcessingAll}
              isFFmpegLoaded={isFFmpegLoaded}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t">
          <div className="text-center text-gray-600">
            <p className="mb-4">
              Built with ❤️ using Next.js, FFmpeg WASM, and shadcn/ui
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <span className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>No data leaves your device</span>
              </span>
              <span className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>Powered by WebAssembly</span>
              </span>
              <span className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>Works offline</span>
              </span>
            </div>
          </div>
        </footer>
      </main>
      
      {/* Toast Notifications */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
