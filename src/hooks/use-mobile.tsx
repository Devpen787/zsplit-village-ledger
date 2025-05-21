
import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set the initial value
    checkSize();

    // Add event listener
    window.addEventListener('resize', checkSize);

    // Clean up
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return isMobile;
};

// For backward compatibility
export const useMobile = useIsMobile;
