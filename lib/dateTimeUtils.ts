// Enhanced date and time extraction utility

export interface ExtractedDateTime {
  date: string | null;
  time: string | null;
  location: string | null;
}

export function extractDateTime(text: string): ExtractedDateTime {
  const result: ExtractedDateTime = {
    date: null,
    time: null,
    location: null
  };

  // Date extraction patterns
  const datePatterns = [
    // Explicit dates: "December 15", "Dec 15", "12/15/2024", "2024-12-15"
    /(?:(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)/gi,
    /\d{1,2}\/\d{1,2}\/\d{4}/g,
    /\d{4}-\d{1,2}-\d{1,2}/g,
    // Relative dates: "tomorrow", "next week", "in 3 days"
    /(?:tomorrow|next\s+(?:week|month|friday|saturday|sunday|monday|tuesday|wednesday|thursday))/gi,
    /in\s+\d+\s+(?:days?|weeks?|months?)/gi
  ];

  // Time extraction patterns
  const timePatterns = [
    // Explicit times: "7 PM", "19:00", "7:30 in the evening"
    /\d{1,2}:\d{2}\s*(?:am|pm)?/gi,
    /\d{1,2}\s*(?:am|pm)/gi,
    // Relative times: "morning", "afternoon", "evening"
    /(?:morning|afternoon|evening|night)/gi
  ];

  // Location extraction patterns
  const locationPatterns = [
    // Look for "at [location]", "in [location]", addresses
    /(?:at|in|@)\s+([^,\n.!?]+(?:street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|way|place|pl|court|ct|circle|cir|park|center|centre|hall|room|building|office|cafe|restaurant|bar|club|gym|school|university|college|library|museum|theater|theatre|stadium|arena|hotel|mall|plaza|square))/gi,
    /(?:at|in|@)\s+([A-Z][^,\n.!?]*(?:Park|Center|Centre|Hall|Room|Building|Office|Cafe|Restaurant|Bar|Club|Gym|School|University|College|Library|Museum|Theater|Theatre|Stadium|Arena|Hotel|Mall|Plaza|Square))/g,
    // Generic location patterns
    /(?:at|in|@)\s+([^,\n.!?]{3,30})/gi
  ];

  // Extract dates
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      result.date = parseDate(matches[0]);
      break;
    }
  }

  // Extract times
  for (const pattern of timePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      result.time = parseTime(matches[0]);
      break;
    }
  }

  // Extract locations
  for (const pattern of locationPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Clean up the location (remove "at", "in", "@" prefixes)
      let location = matches[0].replace(/^(?:at|in|@)\s+/i, '').trim();
      if (location.length > 3 && location.length < 100) {
        result.location = location;
        break;
      }
    }
  }

  return result;
}

function parseDate(dateStr: string): string {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  try {
    // Handle relative dates
    if (dateStr.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }

    if (dateStr.toLowerCase().includes('next week')) {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }

    // Handle "in X days" pattern
    const inDaysMatch = dateStr.match(/in\s+(\d+)\s+days?/i);
    if (inDaysMatch) {
      const days = parseInt(inDaysMatch[1]);
      const futureDate = new Date(currentDate);
      futureDate.setDate(futureDate.getDate() + days);
      return futureDate.toISOString().split('T')[0];
    }

    // Handle explicit dates
    if (dateStr.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
      return dateStr; // Already in correct format
    }

    if (dateStr.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Handle month names
    const monthNames = {
      'january': '01', 'jan': '01',
      'february': '02', 'feb': '02',
      'march': '03', 'mar': '03',
      'april': '04', 'apr': '04',
      'may': '05',
      'june': '06', 'jun': '06',
      'july': '07', 'jul': '07',
      'august': '08', 'aug': '08',
      'september': '09', 'sep': '09',
      'october': '10', 'oct': '10',
      'november': '11', 'nov': '11',
      'december': '12', 'dec': '12'
    };

    const monthMatch = dateStr.match(/(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/gi);
    if (monthMatch) {
      const parts = monthMatch[0].toLowerCase().split(/\s+/);
      const monthName = parts[0].replace('.', '');
      const day = parts[1].replace(/[^\d]/g, '');
      const year = parts[2] || currentYear.toString();
      
      const monthNum = monthNames[monthName as keyof typeof monthNames];
      if (monthNum) {
        return `${year}-${monthNum}-${day.padStart(2, '0')}`;
      }
    }

    // Fallback: try to parse as a date
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }

  } catch (error) {
    console.error('Error parsing date:', error);
  }

  return null;
}

function parseTime(timeStr: string): string {
  try {
    // Handle relative times
    if (timeStr.toLowerCase().includes('morning')) {
      return '09:00';
    }
    if (timeStr.toLowerCase().includes('afternoon')) {
      return '14:00';
    }
    if (timeStr.toLowerCase().includes('evening')) {
      return '19:00';
    }
    if (timeStr.toLowerCase().includes('night')) {
      return '20:00';
    }

    // Handle explicit times
    const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch[3]?.toLowerCase();

      if (ampm === 'pm' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'am' && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Handle 24-hour format
    const time24Match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (time24Match) {
      const hours = parseInt(time24Match[1]);
      const minutes = parseInt(time24Match[2]);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

  } catch (error) {
    console.error('Error parsing time:', error);
  }

  return null;
}