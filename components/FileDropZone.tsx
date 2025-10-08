"use client";

import { useDropzone } from 'react-dropzone';
import { Upload, File, Image, Video, Music } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FileWithPreview extends File {
  preview?: string;
}

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onRemoveFile?: (file: File) => void;
  selectedFiles: File[];
  isProcessing?: boolean;
}

const getFileIcon = (file: File) => {
  const type = file.type;
  
  if (type.startsWith('image/')) {
    return <Image className="w-8 h-8 text-blue-500" />;
  } else if (type.startsWith('video/')) {
    return <Video className="w-8 h-8 text-green-500" />;
  } else if (type.startsWith('audio/')) {
    return <Music className="w-8 h-8 text-purple-500" />;
  } else {
    return <File className="w-8 h-8 text-gray-500" />;
  }
};

const getFileTypeColor = (file: File) => {
  const type = file.type;
  
  if (type.startsWith('image/')) {
    return 'bg-blue-100 text-blue-800';
  } else if (type.startsWith('video/')) {
    return 'bg-green-100 text-green-800';
  } else if (type.startsWith('audio/')) {
    return 'bg-purple-100 text-purple-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileDropZone({ onFilesSelected, onRemoveFile, selectedFiles, isProcessing }: FileDropZoneProps) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.flac'],
    },
    disabled: isProcessing,
    onDrop: (acceptedFiles) => {
      onFilesSelected(acceptedFiles);
    },
  });

  const removeFile = (fileToRemove: File) => {
    if (onRemoveFile) {
      onRemoveFile(fileToRemove);
    } else {
      // Fallback to the old behavior if onRemoveFile is not provided
      const updatedFiles = selectedFiles.filter(file => file !== fileToRemove);
      onFilesSelected(updatedFiles);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <Card 
        {...getRootProps()} 
        className={`
          border-2 border-dashed transition-colors cursor-pointer p-8
          ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-gray-400' : ''}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Upload className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-blue-600">Drop your files here!</p>
              <p className="text-sm text-blue-500">We support images, videos, and audio files</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports: Images (PNG, JPG, GIF), Videos (MP4, AVI, MOV), Audio (MP3, WAV, AAC)
              </p>
            </div>
          )}
          
          {isDragReject && (
            <p className="text-sm text-red-500">
              Some files are not supported. Please use images, videos, or audio files.
            </p>
          )}
        </div>
      </Card>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={`ml-2 ${getFileTypeColor(file)}`}
                  >
                    {file.type.split('/')[0]}
                  </Badge>
                </div>
                
                {!isProcessing && (
                  <button
                    onClick={() => removeFile(file)}
                    className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
