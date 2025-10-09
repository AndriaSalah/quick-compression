"use client";

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video } from 'lucide-react';
import { CompressionOptions } from '@/types';

interface VideoSettingsProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
}

export function VideoSettings({ options, onOptionsChange }: VideoSettingsProps) {
  const updateOption = (key: keyof CompressionOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Video className="w-5 h-5 text-green-500" />
        <Label className="text-lg font-medium">Video Settings</Label>
      </div>

      {/* Video Codec */}
      <div className="space-y-2">
        <Label>Video Codec</Label>
        <Select
          value={options.vcodec || 'libx264'}
          onValueChange={(value) => updateOption('vcodec', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select codec" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="libx264">H.264 (x264) - Universal compatibility</SelectItem>
            <SelectItem value="libx265">H.265 (x265) - Better compression</SelectItem>
            <SelectItem value="libvpx-vp9">VP9 - Open source, good compression</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Preset */}
      <div className="space-y-2">
        <Label>Encoding Speed</Label>
        <Select
          value={options.preset || 'medium'}
          onValueChange={(value) => updateOption('preset', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ultrafast">Ultra Fast (Largest files)</SelectItem>
            <SelectItem value="fast">Fast</SelectItem>
            <SelectItem value="medium">Medium (Balanced)</SelectItem>
            <SelectItem value="slow">Slow (Better compression)</SelectItem>
            <SelectItem value="veryslow">Very Slow (Best compression)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CRF Quality */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Quality (CRF)</Label>
          <span className="text-sm text-gray-500">{options.crf || 23}</span>
        </div>
        <Slider
          value={[options.crf || 23]}
          onValueChange={(value) => updateOption('crf', value[0])}
          max={51}
          min={0}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-gray-500">Lower values = better quality, larger files. Recommended: 18-28</p>
      </div>

      {/* Resolution */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Max Width (px)</Label>
          <Input
            type="number"
            value={options.maxWidth || 1920}
            onChange={(e) => updateOption('maxWidth', parseInt(e.target.value))}
            min={320}
            max={4096}
            step={16}
          />
        </div>
        <div className="space-y-2">
          <Label>Max Height (px)</Label>
          <Input
            type="number"
            value={options.maxHeight || 1080}
            onChange={(e) => updateOption('maxHeight', parseInt(e.target.value))}
            min={240}
            max={2160}
            step={16}
          />
        </div>
      </div>

      {/* Scale Preset */}
      <div className="space-y-2">
        <Label>Resolution Preset</Label>
        <Select
          value={options.scale || 'original'}
          onValueChange={(value) => {
            updateOption('scale', value);
            // Set dimensions based on preset
            if (value === '720p') {
              updateOption('maxWidth', 1280);
              updateOption('maxHeight', 720);
            } else if (value === '1080p') {
              updateOption('maxWidth', 1920);
              updateOption('maxHeight', 1080);
            } else if (value === '1440p') {
              updateOption('maxWidth', 2560);
              updateOption('maxHeight', 1440);
            } else if (value === '4k') {
              updateOption('maxWidth', 3840);
              updateOption('maxHeight', 2160);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="original">Keep Original</SelectItem>
            <SelectItem value="720p">720p (1280x720)</SelectItem>
            <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
            <SelectItem value="1440p">1440p (2560x1440)</SelectItem>
            <SelectItem value="4k">4K (3840x2160)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}