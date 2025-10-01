// Utility functions for date and time parsing

export interface DateTimeExtraction {
  date: string | null;
  time: string | null;
  location: string | null;
}

// Common date patterns and their regex
const datePatterns = [
  // Explicit dates
  { pattern: /(\d{1,2}\/\d{1,2}\/\d{4})/, type: 'explicit' },
  { pattern: /(\d{4}-\d{2}-\d{2})/, type: 'explicit' },
  { pattern: /(\d{1,2}-\d{1,2}-\d{4})/, type: 'explicit' },
  
  // Month day patterns
  { pattern: /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/i, type: 'month_day' },
  { pattern: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/i, type: 'month_day_short' },
  
  // Relative dates
  { pattern: /\b(today)\b/i, type: 'relative' },
  { pattern: /\b(tomorrow)\b/i, type: 'relative' },
  { pattern: /\b(yesterday)\b/i, type: 'relative' },
  { pattern: /\bin\s+(\d+)\s+(day|days|week|weeks|month|months)\b/i, type: 'relative_future' },
  { pattern: /\b(\d+)\s+(day|days|week|weeks|month|months)\s+from\s+now\b/i, type: 'relative_future' },
  { pattern: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, type: 'next_weekday' },
  { pattern: /\bthis\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, type: 'this_weekday' },
];

// Common time patterns
const timePatterns = [
  // Explicit times
  { pattern: /(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)/g, type: 'explicit_12h' },
  { pattern: /(\d{1,2})\s*(am|pm|AM|PM)/g, type: 'explicit_12h_no_minutes' },
  { pattern: /(\d{1,2}):(\d{2})/g, type: 'explicit_24h' },
  
  // Relative times
  { pattern: /\b(morning|early morning)\b/i, type: 'relative' },
  { pattern: /\b(afternoon|mid-day|midday|noon)\b/i, type: 'relative' },
  { pattern: /\b(evening|night|late)\b/i, type: 'relative' },
  { pattern: /\b(dawn|sunrise)\b/i, type: 'relative' },
  { pattern: /\b(dusk|sunset)\b/i, type: 'relative' },
  
  // Specific time phrases
  { pattern: /\bat\s+(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/g, type: 'at_time' },
];

// Location patterns
const locationPatterns = [
  { pattern: /\bat\s+([^,.\n!?]+?)(?:\s+on\s+|\s+at\s+|\s*,|\s*\.|\s*!|\s*\?|$)/i, type: 'at_location' },
  { pattern: /\bin\s+([^,.\n!?]+?)(?:\s+on\s+|\s+at\s+|\s*,|\s*\.|\s*!|\s*\?|$)/i, type: 'in_location' },
  { pattern: /\blocation[:\s]+([^,.\n!?]+)/i, type: 'explicit_location' },
  { pattern: /\bvenue[:\s]+([^,.\n!?]+)/i, type: 'explicit_venue' },
  { pattern: /\baddress[:\s]+([^,.\n!?]+)/i, type: 'explicit_address' },
  { pattern: /\bwhere[:\s]+([^,.\n!?]+)/i, type: 'where_location' },
];

export function extractDateTime(text: string): DateTimeExtraction {
  const result: DateTimeExtraction = {
    date: null,
    time: null,
    location: null,
  };

  // Extract date
  for (const { pattern, type } of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.date = parseDateMatch(match, type);
      if (result.date) break;
    }
  }

  // Extract time
  for (const { pattern, type } of timePatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      result.time = parseTimeMatch(matches[0], type);
      if (result.time) break;
    }
  }

  // Extract location
  for (const { pattern, type } of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.location = parseLocationMatch(match, type);
      if (result.location) break;
    }
  }

  return result;
}

function parseDateMatch(match: RegExpMatchArray, type: string): string | null {
  const currentDate = new Date();
  
  try {
    switch (type) {
      case 'explicit':
        const parsed = new Date(match[1]);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0];
        }
        break;
        
      case 'month_day':
      case 'month_day_short':
        const monthName = match[1].toLowerCase();
        const day = parseInt(match[2]);
        const year = match[3] ? parseInt(match[3]) : currentDate.getFullYear();
        
        const monthMap: { [key: string]: number } = {
          'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
          'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5,
          'jul': 6, 'july': 6, 'aug': 7, 'august': 7, 'sep': 8, 'september': 8,
          'oct': 9, 'october': 9, 'nov': 10, 'november': 10, 'dec': 11, 'december': 11
        };
        
        const month = monthMap[monthName];
        if (month !== undefined) {
          const date = new Date(year, month, day);
          return date.toISOString().split('T')[0];
        }
        break;
        
      case 'relative':
        const relative = match[1].toLowerCase();
        const targetDate = new Date(currentDate);
        
        switch (relative) {
          case 'today':
            return targetDate.toISOString().split('T')[0];
          case 'tomorrow':
            targetDate.setDate(targetDate.getDate() + 1);
            return targetDate.toISOString().split('T')[0];
          case 'yesterday':
            targetDate.setDate(targetDate.getDate() - 1);
            return targetDate.toISOString().split('T')[0];
        }
        break;
        
      case 'relative_future':
        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const futureDate = new Date(currentDate);
        
        switch (unit) {
          case 'day':
          case 'days':
            futureDate.setDate(futureDate.getDate() + amount);
            break;
          case 'week':
          case 'weeks':
            futureDate.setDate(futureDate.getDate() + (amount * 7));
            break;
          case 'month':
          case 'months':
            futureDate.setMonth(futureDate.getMonth() + amount);
            break;
        }
        return futureDate.toISOString().split('T')[0];
        
      case 'next_weekday':
      case 'this_weekday':
        const weekday = match[1].toLowerCase();
        const weekdayMap: { [key: string]: number } = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6
        };
        
        const targetWeekday = weekdayMap[weekday];
        if (targetWeekday !== undefined) {
          const today = currentDate.getDay();
          let daysUntil = targetWeekday - today;
          
          if (type === 'next_weekday') {
            if (daysUntil <= 0) daysUntil += 7;
          } else { // this_weekday
            if (daysUntil < 0) daysUntil += 7;
          }
          
          const targetDate = new Date(currentDate);
          targetDate.setDate(targetDate.getDate() + daysUntil);
          return targetDate.toISOString().split('T')[0];
        }
        break;
    }
  } catch (error) {
    console.error('Error parsing date:', error);
  }
  
  return null;
}

function parseTimeMatch(match: RegExpMatchArray, type: string): string | null {
  try {
    switch (type) {
      case 'explicit_12h':
        const hours12 = parseInt(match[1]);
        const minutes = parseInt(match[2] || '0');
        const period = match[3].toLowerCase();
        
        let hours24 = hours12;
        if (period === 'pm' && hours12 !== 12) hours24 += 12;
        if (period === 'am' && hours12 === 12) hours24 = 0;
        
        return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
      case 'explicit_12h_no_minutes':
        const hoursOnly = parseInt(match[1]);
        const periodOnly = match[2].toLowerCase();
        
        let hours24Only = hoursOnly;
        if (periodOnly === 'pm' && hoursOnly !== 12) hours24Only += 12;
        if (periodOnly === 'am' && hoursOnly === 12) hours24Only = 0;
        
        return `${hours24Only.toString().padStart(2, '0')}:00`;
        
      case 'explicit_24h':
        const hours = parseInt(match[1]);
        const mins = parseInt(match[2]);
        
        if (hours >= 0 && hours <= 23 && mins >= 0 && mins <= 59) {
          return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        }
        break;
        
      case 'relative':
        const timeOfDay = match[1].toLowerCase();
        
        switch (timeOfDay) {
          case 'morning':
          case 'early morning':
            return '09:00';
          case 'afternoon':
          case 'mid-day':
          case 'midday':
          case 'noon':
            return '14:00';
          case 'evening':
            return '19:00';
          case 'night':
          case 'late':
            return '20:00';
          case 'dawn':
          case 'sunrise':
            return '06:00';
          case 'dusk':
          case 'sunset':
            return '18:00';
        }
        break;
        
      case 'at_time':
        // Similar to explicit parsing but with "at" prefix
        const atHours = parseInt(match[1]);
        const atMinutes = parseInt(match[2] || '0');
        const atPeriod = match[3]?.toLowerCase();
        
        let atHours24 = atHours;
        if (atPeriod === 'pm' && atHours !== 12) atHours24 += 12;
        if (atPeriod === 'am' && atHours === 12) atHours24 = 0;
        
        return `${atHours24.toString().padStart(2, '0')}:${atMinutes.toString().padStart(2, '0')}`;
    }
  } catch (error) {
    console.error('Error parsing time:', error);
  }
  
  return null;
}

function parseLocationMatch(match: RegExpMatchArray, type: string): string | null {
  if (!match[1]) return null;
  
  let location = match[1].trim();
  
  // Clean up common artifacts
  location = location.replace(/\s+/g, ' '); // Multiple spaces to single space
  location = location.replace(/^(the|a|an)\s+/i, ''); // Remove articles at start
  
  // Remove trailing punctuation and common words
  location = location.replace(/\s+(on|at|in|for|with|and|or)$/i, '');
  location = location.replace(/[,.]$/, '');
  
  return location.length > 0 ? location : null;
}

// Helper function to format extracted data for display
export function formatExtractedData(extraction: DateTimeExtraction): string {
  const parts = [];
  
  if (extraction.date) {
    const date = new Date(extraction.date);
    parts.push(date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }
  
  if (extraction.time) {
    const [hours, minutes] = extraction.time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    parts.push(date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }));
  }
  
  if (extraction.location) {
    parts.push(`at ${extraction.location}`);
  }
  
  return parts.join(' ');
}