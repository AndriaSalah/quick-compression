"use client";

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { CompressionOptions } from '@/types';

interface PdfSettingsProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
}

export function PdfSettings({ options, onOptionsChange }: PdfSettingsProps) {
  const updateOption = (key: keyof CompressionOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-red-500" />
        <Label className="text-lg font-medium">PDF Settings</Label>
      </div>

      {/* PDF Quality */}
      <div className="space-y-2">
        <Label>Compression Quality</Label>
        <Select
          value={options.pdfQuality || 'printer'}
          onValueChange={(value) => updateOption('pdfQuality', value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="screen">Screen (Maximum compression)</SelectItem>
            <SelectItem value="ebook">E-book (Balanced compression)</SelectItem>
            <SelectItem value="printer">Printer (Good quality)</SelectItem>
            <SelectItem value="prepress">Prepress (Minimal compression)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Screen quality provides maximum compression, while Prepress maintains highest quality
        </p>
      </div>

      {/* PDF Compatibility */}
      <div className="space-y-2">
        <Label>PDF Version</Label>
        <Select
          value={options.pdfCompatibility || '1.4'}
          onValueChange={(value) => updateOption('pdfCompatibility', value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1.4">PDF 1.4 (Maximum compatibility)</SelectItem>
            <SelectItem value="1.5">PDF 1.5 (Modern features)</SelectItem>
            <SelectItem value="1.6">PDF 1.6 (Advanced features)</SelectItem>
            <SelectItem value="1.7">PDF 1.7 (Latest features)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Options */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Advanced Options</Label>
        
        {/* Remove Metadata */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Remove Metadata</Label>
            <p className="text-xs text-gray-500">Remove document information to reduce file size</p>
          </div>
          <input
            type="checkbox"
            checked={options.removeMetadata !== false}
            onChange={(e) => updateOption('removeMetadata', e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        {/* Optimize Images */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Optimize Images</Label>
            <p className="text-xs text-gray-500">Compress embedded images for smaller file size</p>
          </div>
          <input
            type="checkbox"
            checked={options.optimizeImages !== false}
            onChange={(e) => updateOption('optimizeImages', e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        {/* Linearize */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Linearize for Web</Label>
            <p className="text-xs text-gray-500">Optimize for faster web viewing (page-at-a-time downloading)</p>
          </div>
          <input
            type="checkbox"
            checked={options.linearize !== false}
            onChange={(e) => updateOption('linearize', e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        {/* Grayscale */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Convert to Grayscale</Label>
            <p className="text-xs text-gray-500">Remove color information for maximum compression</p>
          </div>
          <input
            type="checkbox"
            checked={options.grayscale || false}
            onChange={(e) => updateOption('grayscale', e.target.checked)}
            className="h-4 w-4"
          />
        </div>
      </div>
    </div>
  );
}