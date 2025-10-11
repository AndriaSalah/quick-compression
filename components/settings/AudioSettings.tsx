"use client";

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music } from 'lucide-react';
import { AudioCompressionOptions, CompressionOptions } from '@/types';

interface AudioSettingsProps {
  options: CompressionOptions;
  onOptionsChange: (options: AudioCompressionOptions) => void;
}

export function AudioSettings({ options, onOptionsChange }: AudioSettingsProps) {
  const updateOption = (newOptions: AudioCompressionOptions) => {
    onOptionsChange({
      ...options,
      ...newOptions
    });
    console.log('Updated options:', {...options, ...newOptions})
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Music className="w-5 h-5 text-purple-500" />
        <Label className="text-lg font-medium">Audio Settings</Label>
      </div>

      {/* Audio Codec */}
      <div className="space-y-2">
        <Label>Audio Codec</Label>
        <Select
          value={options.acodec || 'aac'}
          onValueChange={(value) => updateOption({ acodec: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select codec" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aac">AAC (Best compatibility)</SelectItem>
            <SelectItem value="mp3">MP3 (Universal)</SelectItem>
            <SelectItem value="opus">Opus / Vorbis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bitrate */}
      <div className="space-y-2">
        <Label>Bitrate</Label>
        <Select
          value={options.bitrate || '128k'}
          onValueChange={(value) => updateOption({ bitrate: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select bitrate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="32k">32 kbps (Voice quality)</SelectItem>
            <SelectItem value="64k">64 kbps (Low quality)</SelectItem>
            <SelectItem value="96k">96 kbps (FM radio quality)</SelectItem>
            <SelectItem value="128k">128 kbps (Standard quality)</SelectItem>
            <SelectItem value="192k">192 kbps (High quality)</SelectItem>
            <SelectItem value="256k">256 kbps (Very high quality)</SelectItem>
            <SelectItem value="320k">320 kbps (Maximum quality)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sample Rate */}
      <div className="space-y-2">
        <Label>Sample Rate</Label>
        <Select
          value={options.sampleRate || '44100'}
          onValueChange={(value) => updateOption({ sampleRate: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sample rate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8000">8 kHz (Phone quality)</SelectItem>
            <SelectItem value="16000">16 kHz (Voice quality)</SelectItem>
            <SelectItem value="22050">22.05 kHz (Radio quality)</SelectItem>
            <SelectItem value="44100">44.1 kHz (CD quality)</SelectItem>
            <SelectItem value="48000">48 kHz (Professional)</SelectItem>
            <SelectItem value="96000">96 kHz (High-end audio)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Channels */}
      <div className="space-y-2">
        <Label>Channels</Label>
        <Select
          value={options.channels?.toString() || '2'}
          onValueChange={(value) => updateOption({ channels: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Mono (1 channel)</SelectItem>
            <SelectItem value="2">Stereo (2 channels)</SelectItem>
            <SelectItem value="6">5.1 Surround (6 channels)</SelectItem>
            <SelectItem value="8">7.1 Surround (8 channels)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality Presets */}
      <div className="space-y-2">
        <Label>Quality Preset</Label>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => {
              updateOption({
                bitrate: '32k',
                sampleRate: '16000',
                channels: 1
              });
            }}
            className={`p-3 text-left border rounded-lg transition-all duration-200 ${
              options.bitrate === '32k' && options.sampleRate === '16000' && options.channels === 1
                ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm'
                : 'border-border bg-card hover:bg-muted hover:border-muted-foreground/30'
            }`}
          >
            <div className="font-medium text-sm text-foreground">Voice Quality</div>
            <div className="text-xs text-muted-foreground/70">32k • 16kHz • Mono</div>
          </button>
          
          <button
            onClick={() => {
              updateOption({
                bitrate: '128k',
                sampleRate: '44100',
                channels: 2 
              })
            }}
            className={`p-3 text-left border rounded-lg transition-all duration-200 ${
              options.bitrate === '128k' && options.sampleRate === '44100' && options.channels === 2
                ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm'
                : 'border-border bg-card hover:bg-muted hover:border-muted-foreground/30'
            }`}
          >
            <div className="font-medium text-sm text-foreground">Standard Music</div>
            <div className="text-xs text-muted-foreground/70">128k • 44.1kHz • Stereo</div>
          </button>
          
          <button
            onClick={() => {
              updateOption({
                bitrate: '192k',
                sampleRate: '44100',
                channels: 2
              })
            }}
            className={`p-3 text-left border rounded-lg transition-all duration-200 ${
              options.bitrate === '192k' && options.sampleRate === '44100' && options.channels === 2
                ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm'
                : 'border-border bg-card hover:bg-muted hover:border-muted-foreground/30'
            }`}
          >
            <div className="font-medium text-sm text-foreground">High Quality</div>
            <div className="text-xs text-muted-foreground/70">192k • 44.1kHz • Stereo</div>
          </button>
        </div>
      </div>
    </div>
  );
}