export async function shareEvent(eventId: string, eventTitle: string) {
  try {
    // Generate the share URL using the dedicated event route
    const shareUrl = `${window.location.origin}/event/${eventId}`;
    
    if (navigator.share) {
      await navigator.share({
        title: eventTitle,
        text: `Check out this event: ${eventTitle}`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Event link copied to clipboard!');
    }
  } catch (error) {
    console.error('Error sharing event:', error);
    // Fallback for older browsers
    try {
      const shareUrl = `${window.location.origin}/event/${eventId}`;
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
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