/**
 * Generates a compressed filename with appropriate extension mapping
 * @param originalName - The original filename
 * @param suffix - The suffix to add (default: 'compressed')
 * @param outputFormat - The actual output format (overrides extension detection)
 * @returns Generated filename with proper extension
 */
export function generateFileName(
  originalName: string, 
  suffix: string = 'compressed',
  outputFormat?: string
): string {
  const lastDotIndex = originalName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${originalName}_${suffix}`;
  }
  
  const nameWithoutExt = originalName.substring(0, lastDotIndex);
  const originalExtension = originalName.substring(lastDotIndex);
  
  // If outputFormat is provided, use it to determine the new extension
  if (outputFormat) {
    const newExtension = getExtensionFromFormat(outputFormat);
    return `${nameWithoutExt}_${suffix}.${newExtension}`;
  }
  
  // Legacy behavior: adjust extension based on common compression mappings
  if (originalExtension === '.wav' || originalExtension === '.m4a') {
    return `${nameWithoutExt}_${suffix}.mp3`;
  } else if (originalExtension === '.avi' || originalExtension === '.mov') {
    return `${nameWithoutExt}_${suffix}.mp4`;
  }
  
  return `${nameWithoutExt}_${suffix}${originalExtension}`;
}

/**
 * Maps output format to appropriate file extension
 * @param format - The output format
 * @returns The appropriate file extension (without dot)
 */
function getExtensionFromFormat(format: string): string {
  switch (format.toLowerCase()) {
    // Audio formats
    case 'mp3': return 'mp3';
    case 'ogg': return 'ogg';
    case 'wav': return 'wav';
    case 'aac': return 'aac';
    case 'm4a': return 'm4a';
    case 'flac': return 'flac';
    
    // Video formats
    case 'mp4': return 'mp4';
    case 'webm': return 'webm';
    case 'mkv': return 'mkv';
    case 'avi': return 'avi';
    case 'mov': return 'mov';
    
    // Image formats
    case 'jpeg':
    case 'jpg': return 'jpg';
    case 'png': return 'png';
    case 'webp': return 'webp';
    case 'avif': return 'avif';
    case 'bmp': return 'bmp';
    case 'tiff': return 'tiff';
    
    // PDF
    case 'pdf': return 'pdf';
    
    // Default: use the format as-is
    default: return format;
  }
}