/**
 * Client-side utilities for handling large event data uploads
 */

const MAX_INLINE_SIZE = 50000; // 50KB threshold for storing data inline vs R2

export async function uploadEventDataToR2(data: any, type: 'visual-styling' | 'event-metadata'): Promise<string> {
  const response = await fetch('/api/upload-event-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data, type }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload event data');
  }

  const result = await response.json();
  return result.url;
}

export async function prepareEventData(eventData: {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  icon?: string;
  gradient?: string;
  mediaUrl?: string;
  mediaType?: string;
  visualStyling?: any;
  createdBy: string;
}) {
  const prepared = { ...eventData };

  // Handle large visual styling data
  if (eventData.visualStyling) {
    const visualStylingSize = JSON.stringify(eventData.visualStyling).length;
    
    if (visualStylingSize > MAX_INLINE_SIZE) {
      try {
        // Upload to R2 and replace with URL
        const visualStylingUrl = await uploadEventDataToR2(eventData.visualStyling, 'visual-styling');
        prepared.visualStylingUrl = visualStylingUrl;
        delete prepared.visualStyling; // Remove large data from inline
        
        console.log('Large visual styling uploaded to R2:', visualStylingUrl);
      } catch (error) {
        console.error('Failed to upload visual styling to R2:', error);
        // Keep original data but log the issue
        console.warn('Falling back to inline visual styling due to upload failure');
      }
    }
  }

  return prepared;
}

export function calculateEventDataSize(eventData: any): number {
  return JSON.stringify(eventData).length;
}

export function shouldUseR2Storage(data: any): boolean {
  return JSON.stringify(data).length > MAX_INLINE_SIZE;
}