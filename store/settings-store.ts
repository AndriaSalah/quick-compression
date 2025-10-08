import { create } from 'zustand';
import { CompressionOptions } from '@/types';

interface SettingsStore {
  compressionOptions: CompressionOptions;
  
  // Actions
  updateCompressionOptions: (options: CompressionOptions) => void;
  resetCompressionOptions: () => void;
  updateOption: <K extends keyof CompressionOptions>(
    key: K, 
    value: CompressionOptions[K]
  ) => void;
}

const defaultCompressionOptions: CompressionOptions = {
  // Video defaults
  crf: 27,
  preset: 'ultrafast',
  vcodec: 'libx264',
  maxWidth: 720,
  
  // Audio defaults
  bitrate: '32k',
  sampleRate: '16000',
  channels: 1,
  acodec: 'aac',
  
  // Image defaults
  imageQuality: 0.8,
  maxHeight: 1920,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  compressionOptions: defaultCompressionOptions,
  
  updateCompressionOptions: (options) => 
    set({ compressionOptions: options }),
  
  resetCompressionOptions: () => 
    set({ compressionOptions: defaultCompressionOptions }),
  
  updateOption: (key, value) => 
    set(state => ({
      compressionOptions: {
        ...state.compressionOptions,
        [key]: value
      }
    })),
}));