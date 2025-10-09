"use client";

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image } from 'lucide-react';
import { CompressionOptions } from '@/types';

interface ImageSettingsProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
}

export function ImageSettings({ options, onOptionsChange }: ImageSettingsProps) {
  const updateOption = (key: keyof CompressionOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Image className="w-5 h-5 text-blue-500" />
        <Label className="text-lg font-medium">Image Settings</Label>
      </div>

      {/* Image Quality */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Quality</Label>
          <span className="text-sm text-gray-500">{Math.round((options.imageQuality || 0.8) * 100)}%</span>
        </div>
        <Slider
          value={[options.imageQuality || 0.8]}
          onValueChange={(value) => updateOption('imageQuality', value[0])}
          max={1}
          min={0.1}
          step={0.1}
          className="w-full"
        />
        <p className="text-xs text-gray-500">Higher quality = larger file size</p>
      </div>

      {/* Image Format */}
      <div className="space-y-2">
        <Label>Output Format</Label>
        <Select
          value={options.outputFormat || 'jpeg'}
          onValueChange={(value) => updateOption('outputFormat', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jpeg">JPEG (Smaller files)</SelectItem>
            <SelectItem value="png">PNG (Lossless)</SelectItem>
            <SelectItem value="webp">WebP (Modern, efficient)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Maximum Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Max Width (px)</Label>
          <Input
            type="number"
            value={options.maxWidth || 1920}
            onChange={(e) => updateOption('maxWidth', parseInt(e.target.value))}
            min={100}
            max={8000}
            step={100}
          />
        </div>
        <div className="space-y-2">
          <Label>Max Height (px)</Label>
          <Input
            type="number"
            value={options.maxHeight || 1920}
            onChange={(e) => updateOption('maxHeight', parseInt(e.target.value))}
            min={100}
            max={8000}
            step={100}
          />
        </div>
      </div>
    </div>
  );
}