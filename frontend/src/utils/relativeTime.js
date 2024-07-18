// utils/relativeTime.js
import { formatDistanceToNow } from 'date-fns';

const relativeTime = (time) => {
  try {
    const date = new Date(time);
    if (isNaN(date)) throw new Error('Invalid Date');
    return formatDistanceToNow(date, { addSuffix: false });
  } catch (error) {
    console.error('Error in relativeTime:', error);
    return 'Invalid time';
  }
};

export default relativeTime;
