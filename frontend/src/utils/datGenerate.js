// Array of month names
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Array of days (dates)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Calculate the range of years dynamically (e.g., last 100 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  export {
    months,
    days,
    years
  };
  