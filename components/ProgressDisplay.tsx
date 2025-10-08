"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Clock, 
  Zap, 
  TrendingDown, 
  AlertCircle,
  Loader2,
  BarChart3
} from 'lucide-react';

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  timestamp: number;
}

interface ProgressDisplayProps {
  isCompressing: boolean;
  compressionProgress: number | null;
  compressionStats: CompressionStats[];
  error: string | null;
  currentFile?: string;
  isFFmpegLoaded: boolean;
  isFFmpegLoading?: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

export function ProgressDisplay({ 
  isCompressing, 
  compressionProgress, 
  compressionStats, 
  error, 
  currentFile,
  isFFmpegLoaded,
  isFFmpegLoading = false
}: ProgressDisplayProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    if (compressionProgress !== null) {
      const timer = setTimeout(() => {
        setAnimatedProgress(compressionProgress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(0);
    }
  }, [compressionProgress]);

  const latestStats = compressionStats[compressionStats.length - 1];
  const totalOriginalSize = compressionStats.reduce((sum, stat) => sum + stat.originalSize, 0);
  const totalCompressedSize = compressionStats.reduce((sum, stat) => sum + stat.compressedSize, 0);
  const averageCompressionRatio = compressionStats.length > 0 
    ? compressionStats.reduce((sum, stat) => sum + stat.compressionRatio, 0) / compressionStats.length 
    : 0;

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* FFmpeg Loading Status */}
      {isFFmpegLoading && (
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
      )}

      {/* FFmpeg Not Loaded Status */}
      {!isFFmpegLoaded && !isFFmpegLoading && !error && (
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
      )}

      {/* FFmpeg Ready Status */}
      {isFFmpegLoaded && !isCompressing && !isFFmpegLoading && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="font-medium">Compression engine ready!</div>
            <div className="text-xs">You can now process files</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Compression Progress */}
      {isCompressing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span>Compressing{currentFile ? `: ${currentFile}` : '...'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={animatedProgress} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{animatedProgress?.toFixed(0) || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compression Stats Summary */}
      {compressionStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center flex-col text-center space-y-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Files Processed</p>
                  <p className="text-lg font-bold text-gray-900">{compressionStats.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center flex-col text-center space-y-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Compression</p>
                  <p className="text-lg font-bold text-gray-900">
                    {averageCompressionRatio.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center flex-col text-center space-y-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Saved</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatFileSize(totalOriginalSize - totalCompressedSize)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Latest Compression Result */}
      {latestStats && !isCompressing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Latest Compression</span>
              <Badge variant="outline" className="ml-auto">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(latestStats.timestamp)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Original Size</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatFileSize(latestStats.originalSize)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Compressed Size</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatFileSize(latestStats.compressedSize)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Reduction</p>
                <p className="text-lg font-semibold text-blue-600">
                  {latestStats.compressionRatio.toFixed(1)}%
                </p>
              </div>
            </div>
            
            {/* Visual representation */}
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-600">Size comparison:</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-red-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-1000"
                    style={{ width: '100%' }}
                  />
                </div>
                <span className="text-xs text-gray-500 min-w-[60px]">Original</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 bg-green-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-1000"
                    style={{ 
                      width: `${((latestStats.compressedSize / latestStats.originalSize) * 100).toFixed(1)}%` 
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 min-w-[60px]">Compressed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Compression History */}
      {compressionStats.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compression History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {compressionStats.slice().reverse().map((stat, index) => (
                <div 
                  key={stat.timestamp} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">
                        {formatFileSize(stat.originalSize)} → {formatFileSize(stat.compressedSize)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(stat.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline"
                    className={`${
                      stat.compressionRatio > 50 ? 'bg-green-50 text-green-700' :
                      stat.compressionRatio > 25 ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}
                  >
                    -{stat.compressionRatio.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}