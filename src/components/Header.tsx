'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import LiveClock from './LiveClock';
import PersonaToggle from './PersonaToggle';
import { usePersona } from '../context/PersonaContext';
import { tapScale, subtleTap, customEase } from '../lib/animations';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  isDarkTheme?: boolean;
  onToggleTheme?: () => void;
}

export default function Header({
  onOpenMobileMenu,
  selectedCity = 'نابلس',
  onCityChange,
  soundEnabled = true,
  onToggleSound,
  isDarkTheme = true,
  onToggleTheme
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: customEase }}
      className="sticky top-0 z-30 bg-[#0A0F1D]/85 backdrop-blur-xl border-b border-amber-500/15 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        
        {/* Right Section: Mobile Hamburger Toggle + Brand Emblem */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger button with spring tap micro-interaction */}
          <motion.button
            type="button"
            onClick={onOpenMobileMenu}
            whileHover={{ scale: 1.03 }}
            whileTap={tapScale}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            aria-label="فتح القائمة الجانبية"
            className="p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 text-sm font-semibold transition cursor-pointer shadow-sm hover:border-amber-400/40 relative overflow-hidden group"
          >
            <Menu className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">القائمة</span>
          </motion.button>

          {/* Brand Logo & City Indicator */}
          <Link
            href="/#home"
            className="flex items-center gap-2.5 group cursor-pointer"
            title="مِشكاتي • العودة للرئيسية"
          >
            <motion.div
              whileHover={{ scale: 1.06, rotate: 3 }}
              whileTap={subtleTap}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/30 via-amber-600/20 to-emerald-950/30 border border-amber-500/40 flex items-center justify-center shadow-md shadow-amber-950/30 text-amber-300 flex-shrink-0"
            >
              <span className="text-sm">🕯️</span>
              {/* Subtle halo glow behind lantern */}
              <div className="absolute inset-0 rounded-xl bg-amber-400/20 blur-md -z-10 group-hover:opacity-100 opacity-60 transition-opacity" />
            </motion.div>

            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black bg-gradient-to-l from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent font-serif">
                مِشكاتي
              </span>

              {/* City Pill Badge */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={subtleTap}
                onClick={() => {
                  const newCity = selectedCity === 'نابلس' ? 'القدس الشريف' : 'نابلس';
                  if (onCityChange) onCityChange(newCity);
                }}
                className="text-xs font-semibold bg-amber-500/20 text-amber-200 px-2.5 py-1 rounded-full border border-amber-500/30 inline-flex items-center gap-1.5 hover:border-amber-400/50 hover:bg-amber-500/30 transition cursor-pointer shadow-xs"
                title="تغيير المدينة"
              >
                <span>🇵🇸</span>
                <span>{selectedCity}</span>
              </motion.button>
            </div>
          </Link>
        </div>

        {/* Center Section: Real-Time Live Clock Capsule */}
        <div className="flex items-center justify-center flex-grow sm:flex-grow-0">
          <LiveClock />
        </div>

        {/* Left Section: Controls (Persona Switcher, Sound, Theme) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Persona Mode Switcher (مُثابِر / مُثابِرة) */}
          <PersonaToggle />

          {/* Sound Toggle */}
          <motion.button
            type="button"
            onClick={onToggleSound}
            whileHover={{ scale: 1.05 }}
            whileTap={tapScale}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            title={soundEnabled ? 'كتم الأصوات' : 'تفعيل الأصوات'}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30 transition cursor-pointer shadow-sm"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            type="button"
            onClick={onToggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={tapScale}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            title={isDarkTheme ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30 transition cursor-pointer shadow-sm"
          >
            {isDarkTheme ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </motion.button>
        </div>

      </div>
    </motion.header>
  );
}
