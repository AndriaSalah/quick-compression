/**
 * FFmpeg Loading Status Component
 * Shows the loading state when FFmpeg is being initialized
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap } from 'lucide-react';

interface FFmpegStatusProps {
  isFFmpegLoaded: boolean;
  isFFmpegLoading: boolean;
  error: string | null;
}

export function FFmpegStatus({ isFFmpegLoaded, isFFmpegLoading, error }: FFmpegStatusProps) {
  if (error) return null; // Error is handled elsewhere

  if (isFFmpegLoading) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <div className="font-medium">🔧 Downloading compression engine...</div>
            <div className="text-xs">
              Loading FFmpeg WebAssembly modules (~30MB). This may take 10-30 seconds depending on your connection.
            </div>
            <div className="text-xs opacity-75">
              ✨ This only happens once - future compressions will start immediately!
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!isFFmpegLoaded) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-1">
            <div className="font-medium">Compression engine ready to initialize</div>
            <div className="text-xs">
              The engine will automatically download when you compress video or audio files (images use the browser's built-in compression)
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null; // Don't show anything when loaded
}