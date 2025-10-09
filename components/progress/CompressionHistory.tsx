"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CompressionHistoryProps } from '@/types/progress';
import { formatFileSize, formatTime } from '@/lib/utils/formatters';

export function CompressionHistory({ compressionStats }: CompressionHistoryProps) {
  if (compressionStats.length <= 1) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Compression History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {compressionStats.slice().reverse().map((stat, index) => (
            <div 
              key={stat.timestamp} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">
                    {formatFileSize(stat.originalSize)} → {formatFileSize(stat.compressedSize)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(stat.timestamp)}
                  </p>
                </div>
              </div>
              
              <Badge 
                variant="outline"
                className={`${
                  stat.compressionRatio > 50 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  stat.compressionRatio > 25 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}
              >
                -{stat.compressionRatio.toFixed(1)}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}