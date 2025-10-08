"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Video, Music, Settings, Code } from 'lucide-react';
import { CompressionOptions } from '@/types';

interface CompressionSettingsProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
  selectedFiles: File[];
}

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
};

export function CompressionSettings({ options, onOptionsChange, selectedFiles }: CompressionSettingsProps) {
  const [activeTab, setActiveTab] = useState('smart');

  const hasImages = selectedFiles.some(file => file.type.startsWith('image/'));
  const hasVideos = selectedFiles.some(file => file.type.startsWith('video/'));
  const hasAudio = selectedFiles.some(file => file.type.startsWith('audio/'));

  const updateOption = (key: keyof CompressionOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

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
    }
  };

  if (selectedFiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Select files to configure compression settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Compression Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="smart">Smart Presets</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="smart" className="space-y-4 mt-4">
            <div className="text-sm text-gray-600 mb-4">
              Choose optimized presets based on your file types:
            </div>

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
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        options.imageQuality === preset.quality && 
                        options.maxWidth === preset.maxWidth && 
                        options.maxHeight === preset.maxHeight
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-gray-500">{preset.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Quality: {(preset.quality * 100).toFixed(0)}% • Max: {preset.maxWidth}x{preset.maxHeight}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasVideos && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4 text-green-500" />
                  <Label className="font-medium">Video Compression</Label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {presets.video.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset('video', preset)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        options.preset === preset.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-gray-500">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        options.bitrate === preset.bitrate &&
                        options.sampleRate === preset.sampleRate &&
                        options.channels === preset.channels
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-gray-500">{preset.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {preset.bitrate} • {preset.sampleRate}Hz • {preset.channels}ch
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-4">
            {/* Output Format Selection */}
            <div className="space-y-4">
              <Label className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-green-500" />
                <span className="font-medium">Output Format</span>
              </Label>
              <div className="pl-6 border-l-2 border-green-100">
                <Label className="text-sm font-medium">File Extension</Label>
                <Select value={options.outputFormat || 'auto'} onValueChange={(value) => updateOption('outputFormat', value === 'auto' ? undefined : value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (based on file type)</SelectItem>
                    {hasVideos && (
                      <>
                        <SelectItem value="mp4">MP4</SelectItem>
                        <SelectItem value="webm">WebM</SelectItem>
                        <SelectItem value="mkv">MKV</SelectItem>
                        <SelectItem value="avi">AVI</SelectItem>
                      </>
                    )}
                    {hasAudio && (
                      <>
                        <SelectItem value="mp3">MP3</SelectItem>
                        <SelectItem value="aac">AAC</SelectItem>
                        <SelectItem value="ogg">OGG</SelectItem>
                        <SelectItem value="wav">WAV</SelectItem>
                      </>
                    )}
                    {hasImages && (
                      <>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom FFmpeg Args */}
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

            {hasVideos && (
              <div className="space-y-4">
                <Label className="flex items-center space-x-2">
                  <Video className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Video Settings</span>
                </Label>
                
                <div className="space-y-4 pl-6 border-l-2 border-red-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Video Codec</Label>
                      <Select value={options.vcodec || 'libx264'} onValueChange={(value) => updateOption('vcodec', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="libx264">H.264 (libx264)</SelectItem>
                          <SelectItem value="libx265">H.265 (libx265)</SelectItem>
                          <SelectItem value="libvpx-vp9">VP9 (libvpx-vp9)</SelectItem>
                          <SelectItem value="libvpx">VP8 (libvpx)</SelectItem>
                          <SelectItem value="copy">Copy (no re-encoding)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Preset</Label>
                      <Select value={options.preset || 'ultrafast'} onValueChange={(value) => updateOption('preset', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ultrafast">Ultra Fast</SelectItem>
                          <SelectItem value="superfast">Super Fast</SelectItem>
                          <SelectItem value="veryfast">Very Fast</SelectItem>
                          <SelectItem value="faster">Faster</SelectItem>
                          <SelectItem value="fast">Fast</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="slow">Slow</SelectItem>
                          <SelectItem value="slower">Slower</SelectItem>
                          <SelectItem value="veryslow">Very Slow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">CRF (Quality): {options.crf || 27}</Label>
                    <Slider
                      value={[options.crf || 27]}
                      onValueChange={(value) => updateOption('crf', value[0])}
                      max={51}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Best Quality (0)</span>
                      <span>Worst Quality (51)</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Lower values = better quality, larger files. 18-28 is usually good.
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Custom Scale</Label>
                    <Input
                      placeholder="e.g., scale=1280:720 or scale='min(720,iw)':-2"
                      value={options.scale || ''}
                      onChange={(e) => updateOption('scale', e.target.value || undefined)}
                      className="mt-2 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Custom video filter for scaling. Leave empty to use max width setting.
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Max Width: {options.maxWidth || 720}px</Label>
                    <Slider
                      value={[options.maxWidth || 720]}
                      onValueChange={(value) => updateOption('maxWidth', value[0])}
                      max={3840}
                      min={240}
                      step={120}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>240px</span>
                      <span>3840px (4K)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasAudio && (
              <div className="space-y-4">
                <Label className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Audio Settings</span>
                </Label>
                
                <div className="space-y-4 pl-6 border-l-2 border-purple-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Audio Codec</Label>
                      <Select value={options.acodec || 'aac'} onValueChange={(value) => updateOption('acodec', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aac">AAC</SelectItem>
                          <SelectItem value="mp3">MP3</SelectItem>
                          <SelectItem value="libvorbis">Vorbis (OGG)</SelectItem>
                          <SelectItem value="libopus">Opus</SelectItem>
                          <SelectItem value="pcm_s16le">PCM (WAV)</SelectItem>
                          <SelectItem value="copy">Copy (no re-encoding)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Bitrate</Label>
                      <Select value={options.bitrate || '32k'} onValueChange={(value) => updateOption('bitrate', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16k">16 kbps (Very Low)</SelectItem>
                          <SelectItem value="24k">24 kbps (Low)</SelectItem>
                          <SelectItem value="32k">32 kbps (Voice)</SelectItem>
                          <SelectItem value="64k">64 kbps (AM Radio)</SelectItem>
                          <SelectItem value="96k">96 kbps (FM Radio)</SelectItem>
                          <SelectItem value="128k">128 kbps (Standard)</SelectItem>
                          <SelectItem value="192k">192 kbps (High)</SelectItem>
                          <SelectItem value="256k">256 kbps (Very High)</SelectItem>
                          <SelectItem value="320k">320 kbps (Maximum)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Sample Rate</Label>
                      <Select value={options.sampleRate || '16000'} onValueChange={(value) => updateOption('sampleRate', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8000">8 kHz (Phone)</SelectItem>
                          <SelectItem value="16000">16 kHz (Voice)</SelectItem>
                          <SelectItem value="22050">22.05 kHz</SelectItem>
                          <SelectItem value="44100">44.1 kHz (CD)</SelectItem>
                          <SelectItem value="48000">48 kHz (Pro)</SelectItem>
                          <SelectItem value="96000">96 kHz (Hi-Res)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Channels</Label>
                      <Select value={(options.channels || 1).toString()} onValueChange={(value) => updateOption('channels', parseInt(value))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Mono (1)</SelectItem>
                          <SelectItem value="2">Stereo (2)</SelectItem>
                          <SelectItem value="6">5.1 Surround (6)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasImages && (
              <div className="space-y-4">
                <Label className="flex items-center space-x-2">
                  <Image className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Image Settings</span>
                </Label>
                
                <div className="space-y-4 pl-6 border-l-2 border-blue-100">
                  <div>
                    <Label className="text-sm font-medium">Quality: {((options.imageQuality || 0.8) * 100).toFixed(0)}%</Label>
                    <Slider
                      value={[(options.imageQuality || 0.8) * 100]}
                      onValueChange={(value) => updateOption('imageQuality', value[0] / 100)}
                      max={100}
                      min={10}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Lower Quality</span>
                      <span>Higher Quality</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Max Width: {options.maxWidth || 1920}px</Label>
                    <Slider
                      value={[options.maxWidth || 1920]}
                      onValueChange={(value) => updateOption('maxWidth', value[0])}
                      max={4096}
                      min={480}
                      step={120}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>480px</span>
                      <span>4096px</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Max Height: {options.maxHeight || 1920}px</Label>
                    <Slider
                      value={[options.maxHeight || 1920]}
                      onValueChange={(value) => updateOption('maxHeight', value[0])}
                      max={4096}
                      min={480}
                      step={120}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>480px</span>
                      <span>4096px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!hasImages && !hasAudio && !hasVideos && (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No supported files selected</p>
                <p className="text-sm">Upload images, videos, or audio files to see settings</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}