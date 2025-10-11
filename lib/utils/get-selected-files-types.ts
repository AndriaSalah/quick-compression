export const getSelectedFilesTypes = (files: File[]) => {
      const hasImages = files.some(file => file.type.startsWith('image/'));
      const hasVideos = files.some(file => file.type.startsWith('video/'));
      const hasAudio = files.some(file => file.type.startsWith('audio/'));
      const hasPdfs = files.some(file => file.type === 'application/pdf');

      return { hasImages, hasVideos, hasAudio, hasPdfs };
}