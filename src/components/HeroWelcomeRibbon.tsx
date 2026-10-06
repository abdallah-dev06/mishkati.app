'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Copy, Check, RotateCw } from 'lucide-react';

interface HeroWelcomeRibbonProps {
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  greeting?: string;
}

export default function HeroWelcomeRibbon({
  selectedCity = 'نابلس',
  onCityChange,
  greeting
}: HeroWelcomeRibbonProps) {
  const [currentGreeting, setCurrentGreeting] = useState(
    greeting || 'طَابَ يَوْمُكَ بِالهِمَّةِ وَالإِنجَاز، يَا مُثَابِر'
  );
  const [copied, setCopied] = useState(false);
  const [sanaQuote, setSanaQuote] = useState(
    '«احْرِصْ عَلَى مَا يَنْفَعُكَ، وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ — فَالطَّرِيقُ يَبْدَأُ بِخُطْوَةِ عَزْمٍ»'
  );

  useEffect(() => {
    if (!greeting) {
      const h = new Date().getHours();
      if (h >= 4 && h < 12) {
        setCurrentGreeting('صباح الهمّة والبركة، يا مُثابِر ☀️');
      } else if (h >= 12 && h < 17) {
        setCurrentGreeting('طَابَ يَوْمُكَ بِالهِمَّةِ وَالإِنجَاز، يَا مُثَابِر 🌿');
      } else {
        setCurrentGreeting('طَابَ مَسَاؤُكَ بِالسَّكِينَةِ وَالتَّوْفِيق، يَا مُثَابِر 🌙');
      }
    }
  }, [greeting]);

  const cities = [
    'نابلس', 'القدس', 'رام الله', 'غزة', 'الخليل', 'جنين', 'طولكرم', 'قلقيلية', 'أريحا', 'سلفيت', 'طوباس', 'خان يونس', 'رفح', 'يافا', 'حيفا', 'عكا'
  ];

  const handleCopy = () => {
    navigator.clipboard?.writeText(sanaQuote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      aria-label="شريط الترحيب والهمّة"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-amber-950/30 backdrop-blur-xl border border-amber-500/20 p-5 sm:p-6 shadow-xl shadow-black/40"
    >
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Greeting & Palestinian Anchor */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>فلسطين 🇵🇸</span>
            </span>

            {/* Palestinian City Quick Switcher */}
            <div className="relative inline-flex items-center gap-1 bg-slate-950/60 hover:bg-slate-950/80 border border-amber-500/25 rounded-full px-3 py-1 transition shadow-inner">
              <MapPin className="w-3 h-3 text-amber-400" />
              <div className="relative">
                <select
                  aria-label="اختر مدينتك الفلسطينية"
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
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 font-serif tracking-tight">
            «{currentGreeting}»
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            ساعتك محسوبة، وهمتك مباركة، ونور صلواتك حارسٌ لمسيرتك الدراسية.
          </p>
        </div>

        {/* Right: Wisdom & Sana Insight Card */}
        <div className="md:max-w-md w-full bg-slate-950/60 backdrop-blur-md rounded-2xl border border-amber-500/20 p-3 sm:p-3.5 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-1.5 text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>سَـنَـا البَصِيرَة</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                title="نسخ الحكمة"
                className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition text-xs flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied && <span className="text-emerald-400 text-[10px] font-bold">نُسخ</span>}
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 font-serif leading-relaxed text-right line-clamp-2 select-none">
            {sanaQuote}
          </p>
        </div>
      </div>
    </section>
  );
}
