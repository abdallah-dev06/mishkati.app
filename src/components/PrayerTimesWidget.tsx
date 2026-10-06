'use client';

import React, { useState, useEffect } from 'react';

export interface PrayerTimeData {
  name: string;
  key: string;
  tashkeel: string;
  time: string; // e.g. "05:13"
  isNext?: boolean;
  isPast?: boolean;
}

interface PrayerTimesWidgetProps {
  currentCity?: string;
  onCityChange?: (cityId: string) => void;
  prayers?: PrayerTimeData[];
  nextEvent?: {
    name: string;
    tashkeel: string;
    time: string;
    countdown: string;
    label?: string;
  };
  progressPct?: number;
}

const PALESTINIAN_CITIES = [
  { id: 'jerusalem', name: 'القدس' },
  { id: 'nablus', name: 'نابلس' },
  { id: 'ramallah', name: 'رام الله' },
  { id: 'gaza', name: 'غزة' },
  { id: 'hebron', name: 'الخليل' },
  { id: 'jenin', name: 'جنين' },
  { id: 'tulkarm', name: 'طولكرم' },
  { id: 'qalqilya', name: 'قلقيلية' },
  { id: 'jericho', name: 'أريحا' },
  { id: 'salfit', name: 'سلفيت' },
  { id: 'tubas', name: 'طوباس' },
  { id: 'khanyunis', name: 'خان يونس' },
  { id: 'rafah', name: 'رفح' },
  { id: 'jaffa', name: 'يافا' },
  { id: 'haifa', name: 'حيفا' },
  { id: 'acre', name: 'عكا' },
];

export default function PrayerTimesWidget({
  currentCity = 'nablus',
  onCityChange,
  prayers,
  nextEvent,
  progressPct = 54,
}: PrayerTimesWidgetProps) {
  const [selectedCity, setSelectedCity] = useState(currentCity);

  useEffect(() => {
    const saved = localStorage.getItem('mishkati_city');
    if (saved) setSelectedCity(saved);
  }, []);

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
    localStorage.setItem('mishkati_city', cityId);
    if (onCityChange) onCityChange(cityId);
  };

  const defaultPrayers: PrayerTimeData[] = prayers || [
    { key: 'fajr', name: 'الفجر', tashkeel: 'الفَجْر', time: '05:13', isPast: true },
    { key: 'dhuhr', name: 'الظهر', tashkeel: 'الظُّهْر', time: '12:28', isPast: true },
    { key: 'asr', name: 'العصر', tashkeel: 'العَصْر', time: '03:49', isNext: true },
    { key: 'maghrib', name: 'المغرب', tashkeel: 'المَغْرِب', time: '06:21' },
    { key: 'isha', name: 'العشاء', tashkeel: 'العِشَاء', time: '07:38' },
  ];

  const defaultNext = nextEvent || {
    name: 'العصر',
    tashkeel: 'العَصْر',
    time: '03:49',
    countdown: '13د',
    label: 'الصلاة القادمة بعد',
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0c1322] via-[#0f172a] to-[#081f18] border border-amber-500/25 p-6 sm:p-7 text-white shadow-xl shadow-amber-950/25 space-y-5 sm:space-y-6 transition-all backdrop-blur-md w-full max-w-4xl mx-auto my-3">
      {/* Subtle Ambient Background Glows */}
      <div className="absolute -right-20 -top-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 0. Minimalist Top Bar: Palestinian City Selector & Tools */}
      <div className="relative z-10 flex items-center justify-between gap-3 pb-1 border-b border-amber-500/15 text-xs">
        {/* City Pill Badge */}
        <div className="relative inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 rounded-full px-3 py-1.5 transition shadow-inner">
          <span className="text-xs text-amber-400">📍</span>
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => handleCitySelect(e.target.value)}
              aria-label="اختر المدينة الفلسطينية"
              className="appearance-none bg-transparent text-xs font-bold text-amber-200 hover:text-amber-100 focus:outline-none cursor-pointer pr-1 pl-4"
            >
              {PALESTINIAN_CITIES.map((city) => (
                <option key={city.id} value={city.id} className="bg-slate-900 text-amber-100 font-bold">
                  {city.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-amber-400/70">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <span className="text-[10px] text-amber-300/60 border-r border-amber-500/20 pr-2 mr-0.5">فلسطين 🇵🇸</span>
        </div>

        {/* Qibla & Mosque indicator */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-200/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <span>🧭</span>
            <span>158° جنوب شرق</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px] text-amber-200/80 font-mono">
            <span>±0د</span>
          </div>
        </div>
      </div>

      {/* 1. Top Hero Row (Current / Next Event Highlight) */}
      <div className="relative z-10 flex items-center justify-between gap-4 pt-1">
        {/* Right Side: Arabic prayer / event name in traditional calligraphic font with Tashkeel */}
        <div className="text-right space-y-1">
          <h2 className="font-serif text-5xl sm:text-6xl text-amber-100 font-bold tracking-normal leading-tight drop-shadow-[0_2px_12px_rgba(245,158,11,0.25)] select-none">
            {defaultNext.tashkeel}
          </h2>
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span>الصلاة القادمة</span>
          </div>
        </div>

        {/* Left Side: Digital Time & Live Countdown */}
        <div className="text-left flex flex-col items-end" dir="ltr">
          <div className="font-sans text-3xl sm:text-4xl font-semibold text-slate-100 tracking-tight tabular-nums">
            {defaultNext.time}
          </div>
          <div className="flex flex-col items-end text-right" dir="rtl">
            <span className="text-xs text-slate-400 font-medium mt-1">{defaultNext.label || 'الصلاة القادمة بعد'}</span>
            <span className="text-xl font-bold text-amber-400 font-sans tracking-wide mt-0.5 tabular-nums drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]">
              {defaultNext.countdown}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Bottom Prayer Times Row (5 Daily Prayers Grid) */}
      <div className="relative z-10 grid grid-cols-5 gap-1 sm:gap-2 pt-3 pb-1 border-t border-amber-500/15 text-center">
        {defaultPrayers.map((prayer) => {
          if (prayer.isNext) {
            return (
              <div
                key={prayer.key}
                className="flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent border border-amber-400/50 shadow-md shadow-amber-950/30 transition ring-1 ring-amber-400/30"
              >
                <span className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
                  <span>{prayer.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                </span>
                <span className="text-sm sm:text-base font-bold text-amber-100 tabular-nums font-mono">
                  {prayer.time}
                </span>
              </div>
            );
          }

          if (prayer.isPast) {
            return (
              <div
                key={prayer.key}
                className="flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl transition opacity-50 hover:opacity-75"
              >
                <span className="text-xs text-slate-400 mb-1">{prayer.name}</span>
                <span className="text-sm sm:text-base font-medium text-slate-300 tabular-nums font-mono">
                  {prayer.time}
                </span>
              </div>
            );
          }

          return (
            <div
              key={prayer.key}
              className="flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl transition hover:bg-amber-500/5"
            >
              <span className="text-xs text-slate-400 mb-1">{prayer.name}</span>
              <span className="text-sm sm:text-base font-medium text-slate-200 tabular-nums font-mono">
                {prayer.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Progress Timeline Bar (Bottom Edge) */}
      <div className="relative z-10 pt-1">
        <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5" title="نسبة انقضاء الوقت بين الصلاتين">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </section>
  );
}
