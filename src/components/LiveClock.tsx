'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import { softClockColonAnimation, subtleTap, customEase } from '../lib/animations';

export default function LiveClock() {
  const { tokens } = usePersona();
  const [mounted, setMounted] = useState(false);
  const [timeState, setTimeState] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    period: string;
    fullFormattedDate: string;
  }>({
    hours: '12',
    minutes: '00',
    seconds: '00',
    period: 'م',
    fullFormattedDate: ''
  });

  useEffect(() => {
    setMounted(true);

    const updateClock = () => {
      const now = new Date();

      // Palestine Time formatting
      const timeFormatter = new Intl.DateTimeFormat('ar-PS', {
        timeZone: 'Asia/Jerusalem',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      });

      const parts = timeFormatter.formatToParts(now);
      let h = '12';
      let m = '00';
      let s = '00';
      let p = 'م';

      parts.forEach((pt) => {
        if (pt.type === 'hour') h = pt.value.padStart(2, '0');
        if (pt.type === 'minute') m = pt.value.padStart(2, '0');
        if (pt.type === 'second') s = pt.value.padStart(2, '0');
        if (pt.type === 'dayPeriod') p = pt.value.includes('ص') ? 'ص' : 'م';
      });

      // Gregorian Date in Palestine locale
      const gregFormatter = new Intl.DateTimeFormat('ar-PS', {
        timeZone: 'Asia/Jerusalem',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const gregString = gregFormatter.format(now);

      // Hijri Date (Umm al-Qura calendar)
      let hijriString = '';
      try {
        const hijriFormatter = new Intl.DateTimeFormat('ar-PS-u-ca-islamic-umalqura', {
          timeZone: 'Asia/Jerusalem',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        hijriString = hijriFormatter.format(now);
      } catch {
        hijriString = 'التقويم الهجري';
      }

      setTimeState({
        hours: h,
        minutes: m,
        seconds: s,
        period: p,
        fullFormattedDate: `${gregString} م • ${hijriString} هـ`
      });
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md border border-amber-500/20 rounded-full px-3 sm:px-4 py-1.5 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-amber-400 font-mono text-xs font-bold tracking-wider">--:--:--</span>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{
        y: -1.5,
        borderColor: tokens.border,
        boxShadow: `0 8px 24px -6px ${tokens.glow}`,
        transition: { duration: 0.25, ease: customEase }
      }}
      whileTap={subtleTap}
      className="group relative bg-slate-900/75 backdrop-blur-md border border-amber-500/25 rounded-full px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-3 shadow-inner shadow-black/40 transition-colors select-none cursor-default"
      title={`توقيت فلسطين • ${timeState.fullFormattedDate}`}
    >
      {/* Clock Icon with ambient amber breathing pulse */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.85, 1, 0.85]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 border border-amber-500/30"
      >
        <Clock className="w-3 h-3 text-amber-400" />
      </motion.div>

      {/* Digital Time & AM/PM Badge */}
      <div className="flex items-center gap-1 font-mono font-bold text-xs sm:text-sm text-slate-100 tabular-nums">
        <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]">{timeState.hours}</span>
        
        {/* Soft 1-second breathing pulse colon */}
        <motion.span
          animate={softClockColonAnimation}
          className="text-amber-500 font-sans mx-0.5 inline-block"
        >
          :
        </motion.span>
        
        <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]">{timeState.minutes}</span>
        
        {/* Seconds visible on sm+ screens */}
        <motion.span
          animate={softClockColonAnimation}
          className="hidden sm:inline-block text-amber-500 font-sans mx-0.5"
        >
          :
        </motion.span>
        <span className="hidden sm:inline text-amber-400/90 text-xs font-mono">{timeState.seconds}</span>

        {/* Period Badge (ص / م) */}
        <span className="mr-1 text-xs px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-200 border border-amber-500/35 font-bold font-sans">
          {timeState.period}
        </span>
      </div>

      {/* Localized Dual Date (Desktop only >= 1024px) */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] border-r border-amber-500/20 pr-2.5">
        <span className="font-serif truncate max-w-xs">{timeState.fullFormattedDate}</span>
      </div>
    </motion.div>
  );
}
