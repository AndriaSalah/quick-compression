"use client";

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings } from 'lucide-react';
import { CompressionOptions } from '@/types';

interface CustomArgsProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
}

export function CustomArgs({ options, onOptionsChange }: CustomArgsProps) {
  const updateOption = (key: keyof CompressionOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center space-x-2">
        <Settings className="w-4 h-4 text-orange-500" />
        <span className="font-medium">Custom FFmpeg Arguments</span>
      </Label>
      <div className="pl-6 border-l-2 border-orange-100">
        <Label className="text-sm font-medium">Custom Args (overrides all other settings)</Label>
        <Textarea
          placeholder="Example: -vcodec libx264 -crf 23 -preset fast -acodec aac"
          value={options.customArgs?.join(' ') || ''}
          onChange={(e) => {
            const args = e.target.value.trim().split(/\s+/).filter(arg => arg.length > 0);
            updateOption('customArgs', args.length > 0 ? args : undefined);
          }}
          className="mt-2 font-mono text-sm"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter FFmpeg arguments separated by spaces. This will override all other settings.
        </p>
      </div>
    </div>
  );
}