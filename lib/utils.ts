export async function shareEvent(eventId: string, eventTitle: string) {
  try {
    const response = await fetch(`/api/events/${eventId}/share`);
    const data = await response.json();
    
    if (navigator.share) {
      await navigator.share({
        title: eventTitle,
        text: `Check out this event: ${eventTitle}`,
        url: data.shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(data.shareUrl);
      alert('Event link copied to clipboard!');
    }
  } catch (error) {
    console.error('Error sharing event:', error);
    // Fallback for older browsers
    try {
      const response = await fetch(`/api/events/${eventId}/share`);
      const data = await response.json();
      const textArea = document.createElement('textarea');
      textArea.value = data.shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Event link copied to clipboard!');
    } catch (fallbackError) {
      console.error('Fallback share failed:', fallbackError);
      alert('Unable to share event. Please try again.');
    }
  }
}

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}