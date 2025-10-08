/**
 * Compression Progress Component
 * Shows real-time compression progress
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap } from 'lucide-react';

interface CompressionProgressProps {
  isCompressing: boolean;
  compressionProgress: number | null;
  currentFile?: string;
}

export function CompressionProgress({ 
  isCompressing, 
  compressionProgress, 
  currentFile 
}: CompressionProgressProps) {
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

  if (!isCompressing && compressionProgress === null) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isCompressing ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          ) : (
            <Zap className="w-5 h-5 text-green-500" />
          )}
          <span>
            {isCompressing ? 'Compressing...' : 'Compression Complete'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentFile && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Processing:</p>
            <Badge variant="outline" className="max-w-full">
              <span className="truncate">{currentFile}</span>
            </Badge>
          </div>
        )}

        {compressionProgress !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(animatedProgress)}%</span>
            </div>
            <Progress value={animatedProgress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}