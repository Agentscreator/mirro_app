/**
 * Utility functions for handling visual styling data stored in R2
 */

export async function fetchVisualStylingFromR2(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch visual styling: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching visual styling from R2:', error);
    return null;
  }
}

export function getVisualStyling(event: any): any {
  // If there's a visualStylingUrl, prioritize that over inline visualStyling
  if (event.visualStylingUrl) {
    // Return a promise that resolves to the R2 data
    return fetchVisualStylingFromR2(event.visualStylingUrl);
  }
  
  // Fall back to inline visualStyling
  if (event.visualStyling) {
    try {
      return typeof event.visualStyling === 'string' 
        ? JSON.parse(event.visualStyling) 
        : event.visualStyling;
    } catch (error) {
      console.error('Error parsing inline visual styling:', error);
      return null;
    }
  }
  
  return null;
}

export async function getVisualStylingAsync(event: any): Promise<any> {
  // If there's a visualStylingUrl, fetch from R2
  if (event.visualStylingUrl) {
    return await fetchVisualStylingFromR2(event.visualStylingUrl);
  }
  
  // Fall back to inline visualStyling
  if (event.visualStyling) {
    try {
      return typeof event.visualStyling === 'string' 
        ? JSON.parse(event.visualStyling) 
        : event.visualStyling;
    } catch (error) {
      console.error('Error parsing inline visual styling:', error);
      return null;
    }
  }
  
  return null;
}