/**
 * Generates a compressed filename with appropriate extension mapping
 * @param originalName - The original filename
 * @param suffix - The suffix to add (default: 'compressed')
 * @returns Generated filename with proper extension
 */
export function generateFileName(originalName: string, suffix: string = 'compressed'): string {
  const lastDotIndex = originalName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${originalName}_${suffix}`;
  }
  
  const nameWithoutExt = originalName.substring(0, lastDotIndex);
  const extension = originalName.substring(lastDotIndex);
  
  // Adjust extension based on compression type
  if (extension === '.wav' || extension === '.m4a') {
    return `${nameWithoutExt}_${suffix}.mp3`;
  } else if (extension === '.avi' || extension === '.mov') {
    return `${nameWithoutExt}_${suffix}.mp4`;
  }
  
  return `${nameWithoutExt}_${suffix}${extension}`;
}