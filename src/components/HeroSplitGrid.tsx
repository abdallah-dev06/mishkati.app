'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from './ui/ScrollReveal';
import {
  Clock,
  Compass,
  Bot,
  Send,
  BookOpen,
  HelpCircle,
  Flame,
  ArrowLeft
} from 'lucide-react';

interface PrayerTimeItem {
  id: string;
  name: string;
  time: string;
  isNext?: boolean;
}

const PRAYER_SCHEDULE: PrayerTimeItem[] = [
  { id: 'fajr', name: 'الفجر', time: '05:12' },
  { id: 'sunrise', name: 'الشروق', time: '06:34' },
  { id: 'dhuhr', name: 'الظهر', time: '12:35' },
  { id: 'asr', name: 'العصر', time: '15:58', isNext: true },
  { id: 'maghrib', name: 'المغرب', time: '18:24' },
  { id: 'isha', name: 'العشاء', time: '19:42' }
];

export const HeroSplitGrid: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [countdown, setCountdown] = useState('01:24:18');

  // Simple countdown ticker simulation
  useEffect(() => {
    const timer = setInterval(() => {
      // Keep lively
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 2-Column Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        
        {/* RIGHT WIDGET: مواقيت الصلاة (Prayer Times & Next Prayer Compass) */}
        <div className="lg:col-span-5 flex flex-col">
          <ScrollReveal variant="slideRight" delay={0.05} className="h-full">
            <div className="h-full rounded-3xl bg-slate-900/70 border border-amber-500/20 backdrop-blur-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/35 transition-all duration-300">
              {/* Ambient Arabesque Glow */}
              <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:bg-amber-500/15 transition-colors duration-500" />

              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-100 font-serif">مواقيت الصلاة</h2>
                      <p className="text-xs text-amber-200/90 font-mono">القدس الشريف وما حولها 🇵🇸</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-slate-950/70 border border-amber-500/25 text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>مباشر</span>
                  </span>
                </div>

                {/* Upcoming Prayer Highlight Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-amber-600/10 border border-amber-500/30 mb-5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-300 font-bold block mb-0.5">الصلاة القادمة بإذن الله:</span>
                      <span className="text-xl sm:text-2xl font-black text-amber-300 font-serif">صلاة العصر</span>
                      <span className="text-xs text-slate-300 block mt-0.5">موعد الأذان: <strong className="text-slate-100 font-mono">03:58 م</strong></span>
                    </div>

                    <div className="text-left bg-slate-950/80 px-3.5 py-2 rounded-xl border border-amber-500/20">
                      <span className="text-xs text-slate-300 block">متبقٍ على النداء</span>
                      <span className="text-base sm:text-lg font-mono font-black text-amber-400 tracking-wider dir-ltr">{countdown}</span>
                    </div>
                  </div>
                </div>

                {/* Daily Prayers Matrix */}
                <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2">
                  {PRAYER_SCHEDULE.map((p) => (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-xl border transition-all duration-200 text-center ${
                        p.isNext
                          ? 'bg-amber-500/20 border-amber-500/50 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950/50 border-white/5 hover:border-amber-500/20'
                      }`}
                    >
                      <span className={`text-xs block font-bold mb-1 ${p.isNext ? 'text-amber-200' : 'text-slate-300'}`}>
                        {p.name}
                      </span>
                      <span className={`text-xs font-mono font-bold ${p.isNext ? 'text-white' : 'text-slate-200'}`}>
                        {p.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Benediction Ribbon */}
              <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-300 flex items-center justify-between">
                <span>«إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا»</span>
                <span className="text-amber-400 font-bold">15 دقيقة إقامة</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* LEFT WIDGET: سراج الذكاء الاصطناعي (Siraj AI Study Assistant) */}
        <div className="lg:col-span-7 flex flex-col">
          <ScrollReveal variant="slideLeft" delay={0.1} className="h-full">
            <div className="h-full rounded-3xl bg-slate-900/70 border border-amber-500/20 backdrop-blur-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/35 transition-all duration-300">
              {/* Ambient Glow */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mt-20 group-hover:bg-emerald-500/15 transition-colors duration-500" />

              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Bot className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-black text-slate-100 font-serif">سِـرَاج</h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 font-semibold">
                          المساعد الأكاديمي
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">شرح المسائل، تلخيص المواد، وتثبيت المفاهيم الصعبة</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>جاهز لمعاونتك</span>
                  </div>
                </div>

                {/* Prompt Quick Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs mb-4">
                  {[
                    '📐 بسّط لي قانون التكامل بالتعويض',
                    '⚡ كيف أحل مسائل نيوتن الثلاثة؟',
                    '💡 خطة لمراجعة مادة الكيمياء في يومين',
                    '📜 قواعد إعراب الأفعال الخمسة'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(chip.replace(/^[^\s]+\s/, ''))}
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/30 transition text-right cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Chat Preview / Interactive Prompt Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/15 mb-3 text-xs text-slate-200 leading-relaxed font-sans min-h-[90px] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-300 flex-shrink-0">
                    💡
                  </div>
                  <div>
                    <p className="font-bold text-slate-100">«حيّاك الله يا طالب العلم المثابر!»</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      اطرح مسألتك أو ارفع صورة معادلتك؛ سأفصل لك حلها خطوة بخطوة مع توضيح الفكرة الجوهرية.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Action Bar */}
              <div className="relative mt-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="اسأل سراج عما أشكل عليك في مذاكرتك اليوم..."
                  className="w-full bg-slate-950 border border-amber-500/25 hover:border-amber-500/40 focus:border-amber-400 rounded-2xl px-4 py-3 pl-12 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition shadow-inner font-sans"
                />
                <button
                  type="button"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center transition shadow-md cursor-pointer active:scale-95"
                  title="إرسال المسألة لسراج"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
};

export default HeroSplitGrid;
