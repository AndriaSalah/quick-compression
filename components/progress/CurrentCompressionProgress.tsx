"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { CurrentCompressionProgressProps } from '@/types/progress';

export function CurrentCompressionProgress({ 
  isCompressing, 
  compressionProgress, 
  currentFile 
}: CurrentCompressionProgressProps) {
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

  if (!isCompressing) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500 shrink-0" />
          <span>Compressing{currentFile ? `: ${currentFile}` : '...'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress value={animatedProgress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{animatedProgress?.toFixed(0) || 0}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}