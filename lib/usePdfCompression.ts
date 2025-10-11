"use client"

import { useCallback } from 'react';
import { PDFDocument, PDFName } from 'pdf-lib';
import { PdfCompressionOptions } from '@/types';
import { formatFileSizeMB, calculateCompressionStats } from '@/utils/compression-helpers';
import { useFFmpeg } from './useFFmpeg';
import { useCompressionStore } from '@/store/compression-store';

export const usePdfCompression = () => {
  const {
    setCompressionProgress,
    clearError
  } = useFFmpeg();
  const { pdfOptions } = useCompressionStore();

  const compressPdf = useCallback(async (
    file: File,
  ): Promise<Blob> => {
    clearError();
    setCompressionProgress(0);

    try {
      // Use PDF options from store
      const options = pdfOptions;

      setCompressionProgress(10);
      
      // Read the PDF file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      setCompressionProgress(20);
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      setCompressionProgress(40);
      
      // Apply compression options with more aggressive techniques
      
      // Remove metadata if requested (default: true)
      if (options.removeMetadata !== false) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setCreator('');
        pdfDoc.setProducer('');
        pdfDoc.setCreationDate(new Date(0)); // Minimal date
        pdfDoc.setModificationDate(new Date(0)); // Minimal date
        console.log('PDF metadata removed for compression');
      }
      
      setCompressionProgress(50);
      
      // Get form and flatten if requested
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      if (fields.length > 0) {
        console.log(`Found ${fields.length} form fields in PDF`);
        
        // Always flatten forms to reduce file size (forms become non-interactive)
        try {
          form.flatten();
          // console.log('PDF forms flattened for better compression');
        } catch (error) {
          console.warn('Could not flatten PDF forms:', error);
        }
      }
      
      // Remove unused objects and optimize content
      try {
        // Get all pages for optimization
        const pages = pdfDoc.getPages();
        
        // Optimize each page for smaller size
        if (options.optimizeImages !== false) {
          
          // For each page, optimize content and remove unnecessary elements
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            
            try {
              const pageDict = page.node;
              
              // Remove annotations that might contain large data
              const annotsKey = PDFName.of('Annots');
              if (pageDict.has(annotsKey)) {
                pageDict.delete(annotsKey);
              }
              
              // Remove structural parent tree (accessibility data) to reduce size
              const structParentsKey = PDFName.of('StructParents');
              if (pageDict.has(structParentsKey)) {
                pageDict.delete(structParentsKey);
              }
              
              // Remove page transitions
              const transKey = PDFName.of('Trans');
              if (pageDict.has(transKey)) {
                pageDict.delete(transKey);
              }
              
              // Remove thumbnails
              const thumbKey = PDFName.of('Thumb');
              if (pageDict.has(thumbKey)) {
                pageDict.delete(thumbKey);
                // console.log(`Removed thumbnail from page ${i + 1}`);
              }
              
            } catch (error) {
              console.warn(`Could not optimize page ${i + 1}:`, error);
            }
          }
        }
        
        
      } catch (error) {
        console.warn('Could not perform page optimization:', error);
      }
      
      // Additional image downsampling for screen/ebook quality
      if (options.pdfQuality === 'screen' || options.pdfQuality === 'ebook') {
        // console.log('Applying image downsampling for better compression...');
        
        try {
          const pages = pdfDoc.getPages();
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();
            
            // For screen/ebook quality, we can reduce image resolution
            const maxDimension = options.pdfQuality === 'screen' ? 1024 : 1536;
            
            if (width > maxDimension || height > maxDimension) {
              // Scale down page content for smaller images
              const scale = Math.min(maxDimension / width, maxDimension / height);
              
              if (scale < 0.9) { // Only scale if significant reduction
                // console.log(`Downsampling page ${i + 1}: ${width}x${height} -> ${Math.round(width * scale)}x${Math.round(height * scale)}`);
                
                // Note: pdf-lib doesn't provide direct image downsampling
                // The compression will mainly come from object stream compression
                // and content optimization we've already applied
              }
            }
          }
        } catch (error) {
          console.warn('Could not perform image downsampling:', error);
        }
      }
      
      setCompressionProgress(70);
      
      // Configure save options based on compression settings with maximum compression
      const saveOptions: any = {
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectStreamsThreshold: 1, // Most aggressive compression by default
        // Additional compression settings
        preserveStructure: false, // Don't preserve document structure for smaller size
        subset: true // Subset fonts when possible
      };
      
      // Adjust compression level based on quality setting
      if (options.pdfQuality) {
        switch (options.pdfQuality) {
          case 'screen':
            // Maximum compression for screen viewing
            saveOptions.useObjectStreams = true;
            saveOptions.objectStreamsThreshold = 1; // Maximum compression
            saveOptions.preserveStructure = false;
            console.log('Using screen quality - maximum compression');
            break;
          case 'ebook':
            // Aggressive compression for e-books
            saveOptions.useObjectStreams = true;
            saveOptions.objectStreamsThreshold = 5; // Aggressive compression
            saveOptions.preserveStructure = false;
            console.log('Using ebook quality - aggressive compression');
            break;
          case 'printer':
            // Moderate compression for printing
            saveOptions.useObjectStreams = true;
            saveOptions.objectStreamsThreshold = 20; // Moderate compression
            console.log('Using printer quality - moderate compression');
            break;
          case 'prepress':
            // Minimal compression for professional printing
            saveOptions.useObjectStreams = true; // Still use some compression
            saveOptions.objectStreamsThreshold = 50; // Light compression
            console.log('Using prepress quality - light compression');
            break;
          default:
            saveOptions.useObjectStreams = true;
            saveOptions.objectStreamsThreshold = 5;
        }
      } else {
        // Default to aggressive compression settings
        saveOptions.useObjectStreams = true;
        saveOptions.objectStreamsThreshold = 5;
      }
      
      
      setCompressionProgress(70);
      
      // Save the optimized PDF
      // console.log('Saving compressed PDF with options:', saveOptions);
      const compressedPdfBytes = await pdfDoc.save(saveOptions);
      
      setCompressionProgress(90);
      
      // Create the compressed blob - create a new Uint8Array to ensure proper typing
      const uint8Array = new Uint8Array(compressedPdfBytes);
      const compressedBlob = new Blob([uint8Array], { type: 'application/pdf' });

      // Set progress to 100% when complete
      setCompressionProgress(100);

      return compressedBlob;

    } catch (err) {
      const errorMessage = `PDF compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error('PDF compression error:', err);
      
      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.message.includes('Invalid PDF')) {
          throw new Error('PDF compression failed: The file appears to be corrupted or not a valid PDF');
        } else if (err.message.includes('password')) {
          throw new Error('PDF compression failed: Password-protected PDFs are not supported');
        } else if (err.message.includes('permission')) {
          throw new Error('PDF compression failed: This PDF has restrictions that prevent compression');
        }
      }
      
      throw new Error(errorMessage);
    } finally {
      // Reset progress after completion
      setTimeout(() => setCompressionProgress(null), 1000);
    }
  }, [pdfOptions, setCompressionProgress, clearError]);

  return {
    compressPdf
  };
};