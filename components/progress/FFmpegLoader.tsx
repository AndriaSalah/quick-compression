"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Zap, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { FFmpegLoaderProps } from '@/types/progress';

export function FFmpegLoader({ 
  isFFmpegLoaded, 
  isFFmpegLoading, 
  error, 
  isCompressing 
}: FFmpegLoaderProps) {
  return (
    <>
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* FFmpeg Loading Status */}
      {isFFmpegLoading && (
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          <AlertDescription className="text-blue-300">
            <div className="space-y-2">
              <div className="font-medium">Downloading compression engine...</div>
              <div className="text-xs">
                Loading FFmpeg WebAssembly modules (~30MB). This may take 10-30 seconds depending on your connection.
              </div>
              <div className="text-xs opacity-75">
                This only happens once - future compressions will start immediately!
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* FFmpeg Not Loaded Status */}
      {!isFFmpegLoaded && !isFFmpegLoading && !error && (
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <Zap className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <div className="space-y-1">
              <div className="font-medium">Compression engine ready to initialize</div>
              <div className="text-xs">
                The engine will automatically download when you compress video or audio files (images use the browser's built-in compression)
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* FFmpeg Ready Status */}
      {isFFmpegLoaded && !isCompressing && !isFFmpegLoading && (
        <Alert className="border-green-500/30 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            <div className="font-medium">Compression engine ready!</div>
            <div className="text-xs">You can now process files</div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}