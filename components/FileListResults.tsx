"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  File, 
  Image, 
  Video, 
  Music, 
  Trash2, 
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  FolderDown
} from 'lucide-react';
import { FileResult } from '@/types';

interface FileListResultsProps {
  files: FileResult[];
  onRemoveFile: (id: string) => void;
  onRetryFile: (id: string) => void;
  onRecompressFile: (id: string) => void;
  onCompressFile: (id: string) => void;
  onDownloadFile: (id: string) => void;
  onDownloadAll: () => void;
  onCompressAll: () => void;
  onClearAll: () => void;
  isProcessing: boolean;
  isFFmpegLoaded: boolean;
}

const getFileIcon = (file: File) => {
  const type = file.type;
  
  if (type.startsWith('image/')) {
    return <Image className="w-5 h-5 text-blue-500" />;
  } else if (type.startsWith('video/')) {
    return <Video className="w-5 h-5 text-green-500" />;
  } else if (type.startsWith('audio/')) {
    return <Music className="w-5 h-5 text-purple-500" />;
  } else {
    return <File className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusBadge = (status: FileResult['status']) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case 'compressing':
      return <Badge className="bg-blue-500"><Play className="w-3 h-3 mr-1" />Processing</Badge>;
    case 'completed':
      return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return null;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateFileName = (originalName: string, suffix: string = 'compressed') => {
  const lastDotIndex = originalName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${originalName}_${suffix}`;
  }
  
  const nameWithoutExt = originalName.substring(0, lastDotIndex);
  const extension = originalName.substring(lastDotIndex);
  return `${nameWithoutExt}_${suffix}${extension}`;
};

export function FileListResults({
  files,
  onRemoveFile,
  onRetryFile,
  onRecompressFile,
  onCompressFile,
  onDownloadFile,
  onDownloadAll,
  onCompressAll,
  onClearAll,
  isProcessing,
  isFFmpegLoaded,
}: FileListResultsProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFiles(newExpanded);
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const pendingFiles = files.filter(f => f.status === 'pending');
  const processingFiles = files.filter(f => f.status === 'compressing');
  const errorFiles = files.filter(f => f.status === 'error');

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <File className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p>No files selected yet</p>
          <p className="text-sm">Upload files to see them here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>File Processing ({files.length} files)</span>
          </CardTitle>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              onClick={onCompressAll}
              disabled={pendingFiles.length === 0 || isProcessing}
              className="flex items-center space-x-2"
              size="sm"
            >
              {isProcessing ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Compress All ({pendingFiles.length})</span>
                </>
              )}
            </Button>

            {completedFiles.length > 0 && (
              <Button
                onClick={onDownloadAll}
                variant="outline"
                size="sm"
                disabled={isProcessing}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download All ({completedFiles.length})</span>
              </Button>
            )}

            <Button
              onClick={onClearAll}
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear All</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{pendingFiles.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{processingFiles.length}</p>
              <p className="text-sm text-muted-foreground">Processing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{completedFiles.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{errorFiles.length}</p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {files.map((fileResult) => (
              <div key={fileResult.id} className="border rounded-lg p-3">
                <div className="space-y-3">
                  {/* File Info Row */}
                  <div className="flex items-center space-x-3">
                    {getFileIcon(fileResult.originalFile)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={fileResult.originalFile.name}>
                        {fileResult.originalFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileResult.originalSize)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(fileResult.status)}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center space-x-2">
                      {fileResult.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => onCompressFile(fileResult.id)}
                          disabled={isProcessing}
                          className="flex items-center space-x-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Compress</span>
                        </Button>
                      )}

                      {fileResult.status === 'completed' && fileResult.compressedBlob && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onDownloadFile(fileResult.id)}
                            className="flex items-center space-x-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRecompressFile(fileResult.id)}
                            disabled={isProcessing}
                            className="flex items-center space-x-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Recompress</span>
                          </Button>
                        </>
                      )}

                      {fileResult.status === 'error' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRetryFile(fileResult.id)}
                          disabled={isProcessing}
                          className="flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </Button>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveFile(fileResult.id)}
                      disabled={fileResult.status === 'compressing'}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remove file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {fileResult.status === 'completed' && fileResult.compressedSize && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Original</p>
                        <p className="font-medium">{formatFileSize(fileResult.originalSize)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Compressed</p>
                        <p className="font-medium text-green-400">
                          {formatFileSize(fileResult.compressedSize)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Saved</p>
                        <p className="font-medium text-blue-400">
                          {fileResult.compressionRatio?.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Compression visualization */}
                    <div className="mt-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-muted-foreground">Compression:</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${100 - (fileResult.compressionRatio || 0)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Details */}
                {fileResult.status === 'error' && fileResult.error && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertDescription className="text-xs">
                      {fileResult.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}