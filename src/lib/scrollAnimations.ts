import { Variants, Transition } from 'framer-motion';

/**
 * ============================================================================
 * "مِشكاتي" (Mishkati) - Cinematic Scroll-Driven Reveal Engine
 * High-performance, weighted, dignified, hardware-accelerated scroll animations.
 * Strictly adheres to Islamic-academic aesthetic dignity & calm focus.
 * ============================================================================
 */

// Smooth custom cubic-bezier for natural cinematic deceleration
export const scrollEase = [0.16, 1, 0.3, 1] as const;

// Default viewport configuration for subtle, non-intrusive triggers
export const defaultScrollViewport = {
  once: true,
  amount: 0.15,
  margin: '0px 0px -40px 0px'
} as const;

// Hardware acceleration helper style
export const gpuAccelerationStyle: React.CSSProperties = {
  willChange: 'transform, opacity',
  transform: 'translate3d(0, 0, 0)',
  backfaceVisibility: 'hidden'
};

/**
 * 1. Scroll Fade-Up (Standard Sections & Feature Cards)
 * Soft upward drift with subtle scale stabilization
 */
export const scrollFadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.98
  },
  visible: (custom?: { delay?: number; duration?: number }) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: custom?.duration ?? 0.55,
      delay: custom?.delay ?? 0,
      ease: scrollEase
    }
  })
};

/**
 * 2. Staggered Container (For Card Grids & Interactive Lists)
 * Sequential cascade creating an organized dashboard unveiling
 */
export const scrollStaggerContainerVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: (custom?: { staggerChildren?: number; delayChildren?: number }) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom?.staggerChildren ?? 0.08,
      delayChildren: custom?.delayChildren ?? 0.05
    }
  })
};

/**
 * 3. Directional Horizon Slide (RTL Optimized)
 * Right-to-center for primary Arabesque reading flow, Left-to-center for companions
 */
export const scrollHorizonSlideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20
  },
  visible: (custom?: { delay?: number; duration?: number }) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: custom?.duration ?? 0.55,
      delay: custom?.delay ?? 0,
      ease: scrollEase
    }
  })
};

export const scrollHorizonSlideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20
  },
  visible: (custom?: { delay?: number; duration?: number }) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: custom?.duration ?? 0.55,
      delay: custom?.delay ?? 0,
      ease: scrollEase
    }
  })
};

/**
 * 4. Glow & Amber Border Unveil
 * Cards blossom into obsidian glass prominence with an amber glow border
 */
export const scrollGlowBorderVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    borderColor: 'rgba(245, 158, 11, 0)',
    boxShadow: '0 0 0 rgba(245, 158, 11, 0)'
  },
  visible: (custom?: { delay?: number; duration?: number }) => ({
    opacity: 1,
    y: 0,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(245, 158, 11, 0.1)',
    transition: {
      duration: custom?.duration ?? 0.65,
      delay: custom?.delay ?? 0,
      ease: scrollEase
    }
  })
};

/**
 * 5. Scale & Bloom Variant (Timers, Milestone Medals, Dialogs)
 */
export const scrollScaleUpVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 12
  },
  visible: (custom?: { delay?: number; duration?: number }) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: custom?.duration ?? 0.5,
      delay: custom?.delay ?? 0,
      ease: scrollEase
    }
  })
};

/**
 * 6. Radiant Streak Flame Pulse (Continuous breathing glow once in view)
 */
export const streakFlameRadiantVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: scrollEase
    }
  },
  pulse: {
    scale: [1, 1.06, 1],
    filter: [
      'drop-shadow(0 0 8px rgba(245, 158, 11, 0.35))',
      'drop-shadow(0 0 20px rgba(245, 158, 11, 0.75))',
      'drop-shadow(0 0 8px rgba(245, 158, 11, 0.35))'
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * 7. Reduced Motion Fallback Variants (A11y Compliant)
 */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25 }
  }
};
