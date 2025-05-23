
import { Variants } from 'framer-motion';

/**
 * Custom hook that provides reusable animation variants for components
 */
export const useAnimations = () => {
  // Container animation variants for staggered child animations
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // Item animation variants for individual elements
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4 } 
    }
  };
  
  // Fade animation variants
  const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { duration: 0.3 } 
    }
  };
  
  // Slide animation variants
  const slideVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.4 } 
    }
  };
  
  return {
    containerVariants,
    itemVariants,
    fadeVariants,
    slideVariants
  };
};
