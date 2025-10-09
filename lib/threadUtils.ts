/**
 * Thread utilities for optimizing FFmpeg performance
 * Provides device-aware thread configuration for multithreading
 */

interface ThreadConfig {
  threadsAvailable: number;
  recommendedThreads: number;
  maxConcurrentJobs: number;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
}

/**
 * Detects the number of CPU cores available on the device
 * Returns a safe fallback if detection fails
 */
export const getDeviceCores = (): number => {
  if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
    return navigator.hardwareConcurrency;
  }
  
  // Conservative fallback for devices where detection fails
  return 2;
};

/**
 * Determines device type based on CPU cores and user agent
 */
export const getDeviceType = (): ThreadConfig['deviceType'] => {
  if (typeof navigator === 'undefined') return 'unknown';
  
  const cores = getDeviceCores();
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Mobile device detection
  if (/mobile|android|iphone|ipad|tablet/.test(userAgent)) {
    return cores <= 4 ? 'mobile' : 'tablet';
  }
  
  // Desktop detection
  return 'desktop';
};

/**
 * Calculates optimal thread configuration for FFmpeg based on device capabilities
 */
export const getOptimalThreadConfig = (): ThreadConfig => {
  const threadsAvailable = getDeviceCores();
  const deviceType = getDeviceType();
  
  let recommendedThreads: number;
  let maxConcurrentJobs: number;
  
  switch (deviceType) {
    case 'mobile':
      // Conservative threading for mobile devices to prevent overheating
      recommendedThreads = Math.max(1, Math.floor(threadsAvailable * 0.5));
      maxConcurrentJobs = 1;
      break;
      
    case 'tablet':
      // Moderate threading for tablets
      recommendedThreads = Math.max(2, Math.floor(threadsAvailable * 0.6));
      maxConcurrentJobs = 2;
      break;
      
    case 'desktop':
      // Aggressive threading for desktop devices
      recommendedThreads = Math.max(2, Math.floor(threadsAvailable * 0.8));
      maxConcurrentJobs = Math.max(2, Math.floor(threadsAvailable / 2));
      break;
      
    default:
      // Safe defaults for unknown devices
      recommendedThreads = 2;
      maxConcurrentJobs = 1;
  }
  
  return {
    threadsAvailable,
    recommendedThreads,
    maxConcurrentJobs,
    deviceType
  };
};

/**
 * Gets the optimal thread count for specific compression types
 */
export const getThreadsForCompressionType = (
  type: 'audio' | 'video' | 'image' | 'pdf'
): number => {
  const config = getOptimalThreadConfig();
  
  switch (type) {
    case 'video':
      // Video compression benefits most from multithreading
      return config.recommendedThreads;
      
    case 'audio':
      // Audio compression has moderate threading benefits
      return Math.max(1, Math.floor(config.recommendedThreads * 0.7));
      
    case 'image':
      // Image compression typically uses less threading
      return Math.max(1, Math.floor(config.recommendedThreads * 0.5));
      
    case 'pdf':
      // PDF processing usually single-threaded
      return 1;
      
    default:
      return config.recommendedThreads;
  }
};

/**
 * Creates FFmpeg threading arguments for optimal performance
 */
export const getFFmpegThreadArgs = (
  type: 'audio' | 'video' | 'image' | 'pdf'
): string[] => {
  const threads = getThreadsForCompressionType(type);
  
  return ['-threads', threads.toString()];
};

/**
 * Provides thread configuration info for debugging and UI display
 */
export const getThreadConfigInfo = (): string => {
  const config = getOptimalThreadConfig();
  
  return `Device: ${config.deviceType} | Cores: ${config.threadsAvailable} | Recommended Threads: ${config.recommendedThreads} | Max Concurrent: ${config.maxConcurrentJobs}`;
};

/**
 * Queue manager for batch processing multiple compressions
 */
export class CompressionQueue {
  private queue: Array<() => Promise<any>> = [];
  private running: number = 0;
  private maxConcurrent: number;
  
  constructor() {
    this.maxConcurrent = getOptimalThreadConfig().maxConcurrentJobs;
  }
  
  /**
   * Adds a compression job to the queue
   */
  async add<T>(compressionJob: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await compressionJob();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }
  
  /**
   * Processes the queue with optimal concurrency
   */
  private async processQueue(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    const job = this.queue.shift();
    if (!job) return;
    
    this.running++;
    
    try {
      await job();
    } catch (error) {
      console.error('Queue job failed:', error);
    } finally {
      this.running--;
      this.processQueue(); // Process next job
    }
  }
  
  /**
   * Gets current queue status
   */
  getStatus(): { queued: number; running: number; maxConcurrent: number } {
    return {
      queued: this.queue.length,
      running: this.running,
      maxConcurrent: this.maxConcurrent
    };
  }
}