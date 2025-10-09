"use client";

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Image, Video, Music, FileText } from 'lucide-react';
import { CompressionOptions } from '@/types';

const presets = {
  video: [
    { name: 'Ultra Fast', value: 'ultrafast', description: 'Fastest compression, larger files' },
    { name: 'Fast', value: 'fast', description: 'Good balance of speed and size' },
    { name: 'Medium', value: 'medium', description: 'Better compression, slower' },
    { name: 'Slow', value: 'slow', description: 'Best compression, slowest' },
  ],
  audio: [
    { name: 'Voice', bitrate: '32k', sampleRate: '16000', channels: 1, description: 'Optimized for speech' },
    { name: 'Standard', bitrate: '128k', sampleRate: '44100', channels: 2, description: 'Good for music' },
    { name: 'High Quality', bitrate: '192k', sampleRate: '44100', channels: 2, description: 'High quality music' },
  ],
  image: [
    { name: 'Web', quality: 0.7, maxWidth: 1920, maxHeight: 1920, description: 'Optimized for web' },
    { name: 'Social Media', quality: 0.8, maxWidth: 1080, maxHeight: 1080, description: 'Perfect for social platforms' },
    { name: 'Print', quality: 0.9, maxWidth: 3840, maxHeight: 3840, description: 'High quality for print' },
  ],
  pdf: [
    { name: 'Screen', pdfQuality: 'screen', removeMetadata: true, optimizeImages: true, description: 'Maximum compression for screen viewing' },
    { name: 'E-book', pdfQuality: 'ebook', removeMetadata: true, optimizeImages: true, description: 'Balanced compression for digital reading' },
    { name: 'Printer', pdfQuality: 'printer', removeMetadata: true, optimizeImages: true, description: 'Good quality for printing' },
    { name: 'Prepress', pdfQuality: 'prepress', removeMetadata: false, optimizeImages: false, description: 'Minimal compression, highest quality' },
  ],
};

interface SmartPresetsProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
  selectedFiles: File[];
}

export function SmartPresets({ options, onOptionsChange, selectedFiles }: SmartPresetsProps) {
  const hasImages = selectedFiles.some(file => file.type.startsWith('image/'));
  const hasVideos = selectedFiles.some(file => file.type.startsWith('video/'));
  const hasAudio = selectedFiles.some(file => file.type.startsWith('audio/'));
  const hasPdfs = selectedFiles.some(file => file.type === 'application/pdf');

  const applyPreset = (type: string, preset: any) => {
    if (type === 'video') {
      onOptionsChange({
        ...options,
        preset: preset.value,
      });
    } else if (type === 'audio') {
      onOptionsChange({
        ...options,
        bitrate: preset.bitrate,
        sampleRate: preset.sampleRate,
        channels: preset.channels,
      });
    } else if (type === 'image') {
      onOptionsChange({
        ...options,
        imageQuality: preset.quality,
        maxWidth: preset.maxWidth,
        maxHeight: preset.maxHeight,
      });
    } else if (type === 'pdf') {
      onOptionsChange({
        ...options,
        pdfQuality: preset.pdfQuality,
        removeMetadata: preset.removeMetadata,
        optimizeImages: preset.optimizeImages,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* File Type Summary */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Selected File Types</Label>
        <div className="flex flex-wrap gap-2">
          {hasImages && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Image className="w-3 h-3" />
              <span>Images</span>
            </Badge>
          )}
          {hasVideos && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Video className="w-3 h-3" />
              <span>Videos</span>
            </Badge>
          )}
          {hasAudio && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Music className="w-3 h-3" />
              <span>Audio</span>
            </Badge>
          )}
          {hasPdfs && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>PDFs</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Image Presets */}
      {hasImages && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Image className="w-4 h-4 text-blue-500" />
            <Label className="font-medium">Image Compression</Label>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {presets.image.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset('image', preset)}
                className={`p-3 text-left border rounded-lg transition-all duration-200 ${
                  options.imageQuality === preset.quality &&
                  options.maxWidth === preset.maxWidth &&
                  options.maxHeight === preset.maxHeight
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm'
                    : 'border-border bg-card hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <div className="font-medium text-foreground">{preset.name}</div>
                <div className="text-sm text-muted-foreground">{preset.description}</div>
                <div className="text-xs text-muted-foreground/70 mt-1">
                  Quality: {Math.round(preset.quality * 100)}% • Max: {preset.maxWidth}x{preset.maxHeight}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Presets */}
      {hasVideos && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-green-500" />
            <Label className="font-medium">Video Compression</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.video.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset('video', preset)}
                className={`p-3 text-left border rounded-lg transition-all duration-200 ${
                  options.preset === preset.value
                    ? 'border-green-500 bg-green-500/10 text-green-400 shadow-sm'
                    : 'border-border bg-card hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <div className="font-medium text-foreground">{preset.name}</div>
                <div className="text-sm text-muted-foreground">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio Presets */}
      {hasAudio && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4 text-purple-500" />
            <Label className="font-medium">Audio Compression</Label>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {presets.audio.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset('audio', preset)}
                className={`p-3 text-left border rounded-lg transition-all duration-200 ${
                  options.bitrate === preset.bitrate &&
                  options.sampleRate === preset.sampleRate &&
                  options.channels === preset.channels
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm'
                    : 'border-border bg-card hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <div className="font-medium text-foreground">{preset.name}</div>
                <div className="text-sm text-muted-foreground">{preset.description}</div>
                <div className="text-xs text-muted-foreground/70 mt-1">
                  {preset.bitrate} • {preset.sampleRate}Hz • {preset.channels}ch
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PDF Presets */}
      {hasPdfs && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-red-500" />
            <Label className="font-medium">PDF Compression</Label>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {presets.pdf.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset('pdf', preset)}
                className={`p-3 text-left border rounded-lg transition-all duration-200 ${
                  options.pdfQuality === preset.pdfQuality &&
                  options.removeMetadata === preset.removeMetadata &&
                  options.optimizeImages === preset.optimizeImages
                    ? 'border-red-500 bg-red-500/10 text-red-400 shadow-sm'
                    : 'border-border bg-card hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <div className="font-medium text-foreground">{preset.name}</div>
                <div className="text-sm text-muted-foreground">{preset.description}</div>
                <div className="text-xs text-muted-foreground/70 mt-1">
                  Quality: {preset.pdfQuality} • Metadata: {preset.removeMetadata ? 'Remove' : 'Keep'} • Images: {preset.optimizeImages ? 'Optimize' : 'Keep'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}