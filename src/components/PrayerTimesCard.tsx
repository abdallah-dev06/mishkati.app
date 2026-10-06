'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, ChevronDown } from 'lucide-react';
import { customEase, tapScale, subtleTap } from '../lib/animations';

interface PrayerTimesCardProps {
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  mosqueOffset?: number;
  onOffsetChange?: (delta: number) => void;
}

export interface PrayerSlot {
  key: string;
  name: string;
  tashkeel: string;
  time: string;
  isNext?: boolean;
  isPast?: boolean;
}

export default function PrayerTimesCard({
  selectedCity = 'نابلس',
  onCityChange,
  mosqueOffset = 0,
  onOffsetChange
}: PrayerTimesCardProps) {
  const [nextPrayer] = useState({
    name: 'العَصْر',
    label: 'الصلاة القادمة',
    time: '03:49',
    remainingMinutes: '13',
    remainingSeconds: '45'
  });

  const [prayers] = useState<PrayerSlot[]>([
    { key: 'fajr', name: 'الفجر', tashkeel: 'الفَجْر', time: '05:13', isPast: true },
    { key: 'dhuhr', name: 'الظهر', tashkeel: 'الظُّهْر', time: '12:28', isPast: true },
    { key: 'asr', name: 'العصر', tashkeel: 'العَصْر', time: '03:49', isNext: true },
    { key: 'maghrib', name: 'المغرب', tashkeel: 'المَغْرِب', time: '06:21', isPast: false },
    { key: 'isha', name: 'العشاء', tashkeel: 'العِشَاء', time: '07:38', isPast: false }
  ]);

  const cities = [
    'نابلس', 'القدس', 'رام الله', 'غزة', 'الخليل', 'جنين', 'طولكرم', 'قلقيلية', 'أريحا', 'سلفيت', 'طوباس', 'خان يونس', 'رفح', 'يافا', 'حيفا', 'عكا'
  ];

  return (
    <motion.section
      id="prayerTimesCard"
      aria-label="بطاقة مواقيت الصلاة والمحطة الإيمانية"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.5, ease: customEase }}
      className="relative overflow-hidden rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 p-5 sm:p-6 text-white shadow-xl shadow-black/40 flex flex-col justify-between transition-colors duration-300 hover:border-amber-500/40 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.18)] group will-change-transform"
    >
      {/* Subtle Ambient Background Glows */}
      <div className="absolute -right-20 -top-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* ================= 1. TOP BAR: Palestinian City Selector & Mosque Controls ================= */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-amber-500/15 text-xs">
          
          {/* Palestinian Town Selector Pill Badge */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 rounded-full px-2.5 py-1 transition shadow-inner"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <div className="relative">
              <select
                aria-label="اختر المدينة الفلسطينية"
                value={selectedCity}
                onChange={(e) => onCityChange && onCityChange(e.target.value)}
                className="appearance-none bg-transparent text-xs font-bold text-amber-200 hover:text-amber-100 focus:outline-none cursor-pointer pr-1 pl-4"
              >
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-amber-100 font-bold">
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-amber-400/70">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
            <span className="text-[10px] text-amber-300/60 border-r border-amber-500/20 pr-1.5 mr-0.5 font-serif">
              فلسطين 🇵🇸
            </span>
          </motion.div>

          {/* Quick Tools: Qibla & Mosque Minute Fine-Tuner */}
          <div className="flex items-center gap-1.5">
            {/* Qibla Indicator */}
            <div
              className="inline-flex items-center gap-1 text-[10px] text-amber-200/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20"
              title="اتجاه القبلة في المدينة المحددة"
            >
              <Compass className="w-3 h-3 text-amber-400" />
              <span>158° جنوب شرق</span>
            </div>

            {/* Mosque Minute Offset Adjuster */}
            <div
              className="inline-flex items-center gap-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 text-[10px] text-amber-200/80"
              title="ضبط دقيقة المسجد المحلي"
            >
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={() => onOffsetChange && onOffsetChange(-1)}
                title="تأخير دقيقة"
                className="w-4 h-4 rounded-full hover:bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center cursor-pointer transition"
              >
                -
              </motion.button>
              <span className="font-mono text-amber-200 font-bold px-0.5">
                {mosqueOffset > 0 ? `+${mosqueOffset}` : mosqueOffset}د
              </span>
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={() => onOffsetChange && onOffsetChange(1)}
                title="تقديم دقيقة"
                className="w-4 h-4 rounded-full hover:bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center cursor-pointer transition"
              >
                +
              </motion.button>
            </div>
          </div>

        </div>

        {/* ================= 2. NEXT PRAYER HIGHLIGHT: Radial Counter Display ================= */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-950/70 to-emerald-950/20 border border-amber-500/25 relative overflow-hidden flex items-center justify-between gap-3 shadow-inner">
          <div className="space-y-1">
            <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>{nextPrayer.label}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-amber-100 font-black tracking-normal leading-tight drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)] select-none">
              {nextPrayer.name}
            </h2>
            <div className="text-xs text-slate-400 font-mono font-medium">
              الأذان في موعده: <span className="text-slate-200 font-bold">{nextPrayer.time} م</span>
            </div>
          </div>

          {/* Prominent Glowing Radial Counter Pill with Breathing Amber Halo */}
          <div className="relative flex-shrink-0">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.35, 0.7, 0.35]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 rounded-full bg-amber-500/25 blur-lg -z-10 pointer-events-none"
            />
            <div className="flex flex-col items-center justify-center w-24 h-24 sm:w-26 sm:h-26 rounded-full bg-slate-950/85 border-2 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-center p-2 relative group">
              <span className="text-[10px] text-amber-300/80 font-medium leading-tight">المتبقي</span>
              <span className="text-base sm:text-lg font-bold text-amber-300 font-mono tracking-tight tabular-nums drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] my-0.5">
                {nextPrayer.remainingMinutes}د
              </span>
              <span className="text-[9px] text-slate-400 font-sans">لرفع الأذان</span>
            </div>
          </div>
        </div>

        {/* ================= 3. DAILY 5 PRAYERS STRIP: Compact Horizontal Pills ================= */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
            <span>الصلوات الخمس</span>
            <span className="text-amber-300/80 font-serif">حسب التوقيت الفلسطيني</span>
          </div>

          <div className="grid grid-cols-5 gap-1 sm:gap-1.5 text-center">
            {prayers.map((p) => {
              if (p.isNext) {
                return (
                  <motion.div
                    key={p.key}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 rounded-2xl bg-gradient-to-b from-amber-500/25 via-amber-500/15 to-transparent border border-amber-400/50 shadow-md shadow-amber-950/30 ring-1 ring-amber-400/30"
                  >
                    <span className="text-[11px] font-bold text-amber-300 mb-0.5 flex items-center gap-1">
                      <span>{p.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-amber-100 tabular-nums font-mono">
                      {p.time}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold mt-0.5">القادمة</span>
                  </motion.div>
                );
              }

              if (p.isPast) {
                return (
                  <motion.div
                    key={p.key}
                    whileHover={{ y: -1 }}
                    className="flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 rounded-2xl bg-slate-950/40 border border-white/5 opacity-65 hover:opacity-85 transition"
                  >
                    <span className="text-[11px] text-slate-400 mb-0.5">{p.name}</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-300 tabular-nums font-mono">
                      {p.time}
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans mt-0.5">مضت ✓</span>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={p.key}
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 rounded-2xl bg-slate-950/50 border border-amber-500/10 hover:border-amber-500/25 transition"
                >
                  <span className="text-[11px] text-slate-300 mb-0.5">{p.name}</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 tabular-nums font-mono">
                    {p.time}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans mt-0.5">مرتقبة</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================= 4. PROGRESS TIMELINE BAR ================= */}
        <div className="pt-1 space-y-1">
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5" title="نسبة انقضاء الوقت بين الصلاتين">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '42%' }}
              transition={{ duration: 1.2, ease: customEase }}
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            />
          </div>
        </div>

      </div>
    </motion.section>
  );
}
