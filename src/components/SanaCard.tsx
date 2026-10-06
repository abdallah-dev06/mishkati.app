'use client';

import React, { useState, useEffect } from 'react';
import { SANA_INSIGHTS, SanaItem } from '@/data/sanaData';

export default function SanaCard() {
  const [insight, setInsight] = useState<SanaItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  // دالة اختيار الحكمة المناسبة حسب الوقت
  const getRandomInsight = (excludeId?: number): SanaItem => {
    const hour = new Date().getHours();
    const currentPeriod = hour >= 4 && hour < 17 ? 'morning' : 'night';

    // فلترة الحكم بناءً على الوقت أو الحكم العامة
    const pool = SANA_INSIGHTS.filter(
      (item) => (item.period === currentPeriod || item.period === 'all') && item.id !== excludeId
    );

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex] || SANA_INSIGHTS[0];
  };

  useEffect(() => {
    setInsight(getRandomInsight());
  }, []);

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setInsight((prev) => getRandomInsight(prev?.id));
      setIsAnimating(false);
    }, 250);
  };

  const handleCopy = () => {
    if (!insight) return;
    navigator.clipboard.writeText(`«${insight.text}» — سَنَا مِشكاتي`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!insight) return null;

  const periodLabel = (new Date().getHours() >= 4 && new Date().getHours() < 17) ? 'نفحات الصباح ☀️' : 'سكينة المساء 🌙';

  return (
    <div className="w-full max-w-4xl mx-auto my-3 px-1 sm:px-0">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 dark:from-amber-500/10 dark:via-obsidian-900/80 dark:to-emerald-950/30 bg-white/80 dark:bg-obsidian-900/80 border border-amber-500/25 dark:border-amber-500/30 p-4 sm:p-5 backdrop-blur-md shadow-xs hover:shadow-md transition-all duration-300">
        
        {/* شريط العنوان */}
        <div className="flex items-center justify-between mb-2.5 border-b border-amber-500/15 pb-2">
          <h3 className="text-xs sm:text-sm font-bold tracking-wide text-amber-800 dark:text-amber-300">
            سَـنَـا البَصِيرَة
          </h3>

          <div className="flex items-center gap-1.5">
            {/* زر نسخ السَّنا */}
            <button
              onClick={handleCopy}
              title="نسخ الحكمة"
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/10 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold">✓ نُسخ</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>

            {/* زر تجديد السَّنا */}
            <button
              onClick={handleRefresh}
              title="سَنَا آخر"
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/10 transition-transform active:rotate-180 duration-300 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* نص الحكمة مع حركة التلاشي */}
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0 scale-98' : 'opacity-100 scale-100'}`}>
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-serif leading-relaxed text-center py-1 sm:py-2 px-1 select-none font-medium">
            «{insight.text}»
          </p>
        </div>

      </div>
    </div>
  );
}
