"use client";

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image } from 'lucide-react';
import { ImageCompressionOptions } from '@/types';

interface ImageSettingsProps {
  options: ImageCompressionOptions;
  onOptionsChange: (options: ImageCompressionOptions) => void;
}

export function ImageSettings({ options, onOptionsChange }: ImageSettingsProps) {
  const updateOption = (newOptions: ImageCompressionOptions) => {
    onOptionsChange({
      ...options,
      ...newOptions
    });
    console.log('Updated options:', {...options, ...newOptions})
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
          onValueChange={(value) => updateOption({ imageQuality: value[0] })}
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
          onValueChange={(value) => updateOption({ outputFormat: value })}
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

      {/* Resolution Preset */}
      <div className="space-y-2">
        <Label>Resolution Preset</Label>
        <Select
          value={(() => {
            if (options.maxWidth === 1920 && options.maxHeight === 1080) return '1080p';
            if (options.maxWidth === 1280 && options.maxHeight === 720) return '720p';
            if (options.maxWidth === 854 && options.maxHeight === 480) return '480p';
            if (options.maxWidth === 426 && options.maxHeight === 240) return '240p';
            return 'custom';
          })()}
          onValueChange={(value) => {
            if (value === '1080p') updateOption({ maxWidth: 1920, maxHeight: 1080 });
            else if (value === '720p') updateOption({ maxWidth: 1280, maxHeight: 720 });
            else if (value === '480p') updateOption({ maxWidth: 854, maxHeight: 480 });
            else if (value === '240p') updateOption({ maxWidth: 426, maxHeight: 240 });
            else updateOption({});
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
            <SelectItem value="720p">720p (1280x720)</SelectItem>
            <SelectItem value="480p">480p (854x480)</SelectItem>
            <SelectItem value="240p">240p (426x240)</SelectItem>
          </SelectContent>
        </Select>
        {(() => {
          const preset = [
            { w: 1920, h: 1080 },
            { w: 1280, h: 720 },
            { w: 854, h: 480 },
            { w: 426, h: 240 }
          ];
          const isCustom = !preset.some(p => p.w === options.maxWidth && p.h === options.maxHeight);
          if (isCustom) {
            return (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label>Max Width (px)</Label>
                  <Input
                    type="number"
                    value={options.maxWidth || ''}
                    onChange={(e) => updateOption({ maxWidth: parseInt(e.target.value) })}
                    min={100}
                    max={8000}
                    step={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Height (px)</Label>
                  <Input
                    type="number"
                    value={options.maxHeight || ''}
                    onChange={(e) => updateOption({ maxHeight: parseInt(e.target.value) })}
                    min={100}
                    max={8000}
                    step={10}
                  />
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
}