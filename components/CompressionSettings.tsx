"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { CompressionOptions } from '@/types';
import { getSmartDefaults } from '@/utils/compression-defaults';
import { SmartPresets } from './settings/SmartPresets';
import { ImageSettings } from './settings/ImageSettings';
import { VideoSettings } from './settings/VideoSettings';
import { AudioSettings } from './settings/AudioSettings';
import { PdfSettings } from './settings/PdfSettings';
import { CustomArgs } from './settings/CustomArgs';


interface CompressionSettingsProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
  selectedFiles: File[];
}

export function CompressionSettings({ options, onOptionsChange, selectedFiles }: CompressionSettingsProps) {
  const [activeTab, setActiveTab] = useState('smart');

  const hasImages = selectedFiles.some(file => file.type.startsWith('image/'));
  const hasVideos = selectedFiles.some(file => file.type.startsWith('video/'));
  const hasAudio = selectedFiles.some(file => file.type.startsWith('audio/'));
  const hasPdfs = selectedFiles.some(file => file.type === 'application/pdf');

  // Apply smart defaults when files are selected
  useEffect(() => {
    if (selectedFiles.length > 0) {
      // Find the largest file to determine smart defaults
      const largestFile = selectedFiles.reduce((largest, file) => 
        file.size > largest.size ? file : largest
      );

      // Determine file type for smart defaults
      let fileType = 'other';
      if (largestFile.type.startsWith('image/')) fileType = 'image';
      else if (largestFile.type.startsWith('video/')) fileType = 'video';
      else if (largestFile.type.startsWith('audio/')) fileType = 'audio';
      else if (largestFile.type === 'application/pdf') fileType = 'pdf';

      // Get smart defaults and apply them
      const smartDefaults = getSmartDefaults(largestFile, fileType as any);
      onOptionsChange({
        ...options,
        ...smartDefaults
      });
    }
  }, [selectedFiles]); // Only depend on selectedFiles, not options to avoid loops

  const updateOption = (key: keyof CompressionOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
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

          <TabsContent value="smart" className="space-y-6 mt-4">
            <SmartPresets 
              options={options} 
              onOptionsChange={onOptionsChange} 
              selectedFiles={selectedFiles} 
            />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-4">
            {/* File Type Specific Settings */}
            {/* Custom FFmpeg Arguments (only for video/audio) */}
            {(hasVideos || hasAudio) && (
              <CustomArgs options={options} onOptionsChange={onOptionsChange} />
            )}
            {hasImages && (
              <ImageSettings options={options} onOptionsChange={onOptionsChange} />
            )}

            {hasVideos && (
              <VideoSettings options={options} onOptionsChange={onOptionsChange} />
            )}

            {hasAudio && (
              <AudioSettings options={options} onOptionsChange={onOptionsChange} />
            )}

            {hasPdfs && (
              <PdfSettings options={options} onOptionsChange={onOptionsChange} />
            )}
            {/* No file type selected message */}
            {!hasImages && !hasAudio && !hasVideos && !hasPdfs && (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Upload supported files to see compression options</p>
                <p className="text-sm mt-1">Supports images, videos, audio, and PDFs</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}