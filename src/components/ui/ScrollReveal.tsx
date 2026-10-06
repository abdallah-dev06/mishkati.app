'use client';

import React from 'react';
import { motion, useReducedMotion, Variants, TargetAndTransition, VariantLabels } from 'framer-motion';
import {
  scrollEase,
  defaultScrollViewport,
  gpuAccelerationStyle,
  scrollFadeUpVariants,
  scrollHorizonSlideRightVariants,
  scrollHorizonSlideLeftVariants,
  scrollGlowBorderVariants,
  scrollScaleUpVariants,
  scrollStaggerContainerVariants,
  reducedMotionVariants
} from '@/lib/scrollAnimations';

export type ScrollRevealVariant =
  | 'fadeUp'
  | 'slideRight'
  | 'slideLeft'
  | 'glowBorder'
  | 'scaleUp'
  | 'stagger';

export interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: ScrollRevealVariant;
  delay?: number;
  duration?: number;
  amount?: number | 'some' | 'all';
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
  staggerChildren?: number;
  delayChildren?: number;
}

const variantMap: Record<ScrollRevealVariant, Variants> = {
  fadeUp: scrollFadeUpVariants,
  slideRight: scrollHorizonSlideRightVariants,
  slideLeft: scrollHorizonSlideLeftVariants,
  glowBorder: scrollGlowBorderVariants,
  scaleUp: scrollScaleUpVariants,
  stagger: scrollStaggerContainerVariants
};

/**
 * High-performance, dignified scroll reveal wrapper for "مِشكاتي"
 * Respects prefers-reduced-motion and applies GPU acceleration.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration,
  amount = 0.15,
  once = true,
  className = '',
  style = {},
  staggerChildren = 0.08,
  delayChildren = 0.05
}) => {
  const shouldReduceMotion = useReducedMotion();

  // If the user requests reduced motion, gracefully fall back to simple opacity
  const activeVariants = shouldReduceMotion
    ? reducedMotionVariants
    : variantMap[variant] || scrollFadeUpVariants;

  const customConfig = {
    delay,
    duration,
    staggerChildren,
    delayChildren
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{
        once,
        amount,
        margin: defaultScrollViewport.margin
      }}
      variants={activeVariants}
      custom={customConfig}
      className={className}
      style={{
        ...gpuAccelerationStyle,
        ...style
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Reusable Staggered Container for Grids, Lists, and Multi-Card sections
 */
export interface ScrollRevealContainerProps {
  children: React.ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  amount?: number | 'some' | 'all';
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollRevealContainer: React.FC<ScrollRevealContainerProps> = ({
  children,
  staggerChildren = 0.08,
  delayChildren = 0.05,
  amount = 0.15,
  once = true,
  className = '',
  style = {}
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{
        once,
        amount,
        margin: defaultScrollViewport.margin
      }}
      variants={shouldReduceMotion ? reducedMotionVariants : scrollStaggerContainerVariants}
      custom={{ staggerChildren, delayChildren }}
      className={className}
      style={{
        ...gpuAccelerationStyle,
        ...style
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
