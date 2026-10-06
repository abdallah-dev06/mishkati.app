import { Variants, Transition } from 'framer-motion';

/**
 * ============================================================================
 * "مِشكاتي" (Mishkati) Motion Design Tokens & Physics
 * Designed for calm, dignified, luxurious, and non-distracting interactions.
 * ============================================================================
 */

// Custom cubic-bezier for silk-smooth ease-out
export const customEase = [0.16, 1, 0.3, 1] as const;

// Physics Springs
export const softSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 25,
  mass: 0.8
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 22,
  mass: 1
};

export const snappySpring: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
  mass: 0.7
};

export const defaultTransition: Transition = {
  duration: 0.45,
  ease: customEase
};

// Tap & Press micro-interaction
export const tapScale = {
  scale: 0.97,
  transition: { type: 'spring', stiffness: 400, damping: 20 }
};

export const subtleTap = {
  scale: 0.985,
  transition: { type: 'spring', stiffness: 450, damping: 24 }
};

/**
 * Container Stagger Variant
 */
export const staggerContainer = (
  staggerChildren = 0.08,
  delayChildren = 0.1
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

/**
 * Main Content Cards Staggered Upward Drift
 */
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 14
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: customEase
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.3,
      ease: customEase
    }
  }
};

/**
 * Smooth Fade In
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: customEase
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: customEase
    }
  }
};

/**
 * Subtle Scale In (Dialogs, Badges, Modals)
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 6
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: softSpring
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: { duration: 0.2, ease: customEase }
  }
};

/**
 * Navigation Drawer / Sidebar Variants
 */
export const drawerOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: customEase }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: customEase }
  }
};

export const drawerPanelVariants: Variants = {
  hidden: {
    x: '100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  visible: {
    x: '0%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    x: '100%',
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 32
    }
  }
};

/**
 * Atmospheric & Ambient "Mishkati" Glow Animations
 * Breathing amber halo behind lantern emblems & active prayer counters
 */
export const pulseGlowAnimation = {
  scale: [1, 1.08, 1],
  opacity: [0.35, 0.65, 0.35],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const softClockColonAnimation = {
  opacity: [1, 0.2, 1],
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

/**
 * Task Checkbox Completion Burst Ring Variant
 */
export const burstRingVariants: Variants = {
  initial: {
    scale: 0.8,
    opacity: 1
  },
  burst: {
    scale: 1.35,
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Card Elevation Hover Props for Framer Motion
 */
export const cardHoverMotion = {
  whileHover: {
    y: -3,
    transition: { duration: 0.25, ease: customEase }
  }
};

export const interactiveButtonMotion = {
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: customEase }
  },
  whileTap: tapScale
};
