export const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString);
  
  // Get today and yesterday dates for comparison
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if the date is today or yesterday
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    // Format as Month Day, Year
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
};

export const getExpenseEmoji = (title: string) => {
  // Map common expense categories to emojis
  const emojiMap: {[key: string]: string} = {
    'food': '🍽️',
    'lunch': '🥗',
    'dinner': '🍲',
    'breakfast': '🍳',
    'coffee': '☕',
    'drinks': '🍹',
    'beer': '🍺',
    'wine': '🍷',
    'groceries': '🛒',
    'transport': '🚕',
    'taxi': '🚖',
    'uber': '🚗',
    'hotel': '🏨',
    'accomodation': '🏡',
    'tickets': '🎟️',
    'movie': '🎬',
    'entertainment': '🎭',
    'shopping': '🛍️',
    'gift': '🎁',
    'gas': '⛽',
    'fuel': '⛽',
    'pharmacy': '💊',
    'medicine': '💊',
    'flight': '✈️',
    'train': '🚆',
    'bus': '🚌',
    'cake': '🍰',
    'dessert': '🍨'
  };
  
  // Check if any of the keywords exist in the title
  const lowercaseTitle = title.toLowerCase();
  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (lowercaseTitle.includes(keyword)) {
      return emoji;
    }
  }
  
  // Default emoji
  return '💰';
};

export const getInitials = (name: string): string => {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};
