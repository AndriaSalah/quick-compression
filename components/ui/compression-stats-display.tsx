/**
 * Compression Stats Display Component
 * Shows compression statistics and history
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle2, TrendingDown, Clock } from 'lucide-react';
import { CompressionStats } from '@/types';
import { 
  formatFileSize, 
  formatTime, 
  calculateAverageCompressionRatio,
  calculateTotalSizes 
} from '@/utils/components/progress-display';

interface CompressionStatsDisplayProps {
  compressionStats: CompressionStats[];
}

export function CompressionStatsDisplay({ compressionStats }: CompressionStatsDisplayProps) {
  const latestStats = compressionStats[compressionStats.length - 1];
  const { totalOriginalSize, totalCompressedSize } = calculateTotalSizes(compressionStats);
  const averageCompressionRatio = calculateAverageCompressionRatio(compressionStats);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <span>Compression Statistics</span>
          <Badge variant="secondary">{compressionStats.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {formatFileSize(totalOriginalSize)}
            </p>
            <p className="text-sm text-gray-600">Original Size</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {formatFileSize(totalCompressedSize)}
            </p>
            <p className="text-sm text-gray-600">Compressed Size</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg col-span-2 md:col-span-1">
            <p className="text-2xl font-bold text-purple-600">
              {averageCompressionRatio.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Avg. Reduction</p>
          </div>
        </div>

        {/* Latest File Stats */}
        {latestStats && (
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-medium text-sm">Latest Compression</span>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(latestStats.timestamp)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Original</p>
                <p className="font-medium">{formatFileSize(latestStats.originalSize)}</p>
              </div>
              <div>
                <p className="text-gray-600">Compressed</p>
                <p className="font-medium text-green-600">
                  {formatFileSize(latestStats.compressedSize)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Saved</p>
                <p className="font-medium text-purple-600 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {latestStats.compressionRatio.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}