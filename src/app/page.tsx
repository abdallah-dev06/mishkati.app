'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import HeroSplitGrid from '@/components/HeroSplitGrid';
import QuickHub from '@/components/QuickHub';
import MidmarArena from '@/components/MidmarArena';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Heart, BookOpen, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [city, setCity] = useState('نابلس');
  const [sound, setSound] = useState(true);
  const [isDark, setIsDark] = useState(true);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* 1. Top Navigation Bar */}
      <Header
        onOpenMobileMenu={() => setSidebarOpen(true)}
        selectedCity={city}
        onCityChange={setCity}
        soundEnabled={sound}
        onToggleSound={() => setSound(!sound)}
        isDarkTheme={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* 2. Slide-out Off-canvas Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="home"
      />

      {/* 3. Main Scrollable Canvas */}
      <main className="flex-1 w-full relative z-10 pb-16">
        {/* A. Hero Split Grid (Prayer Times & Siraj AI Study Assistant) */}
        <HeroSplitGrid />

        {/* B. «مِضْمَارُ الإِنْجَاز» (Achievement & Focus Arena) - First in Muthabir Workspace */}
        <MidmarArena />

        {/* C. Quick Hub ("مساحة مُثابِر" - Masar Al-Yawm, Masar Al-Shahr, Mutanaffas) */}
        <QuickHub />
      </main>

      {/* 4. Palestinian Dignified Footer */}
      <footer className="w-full border-t border-amber-500/15 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-400">
        <ScrollReveal variant="fadeUp" delay={0.1}>
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-serif text-sm font-bold">
              <span>🇵🇸</span>
              <span>«مِشكاتي» — نُورُ العِلْمِ وَالسَّعْيِ فِي ثَرَى فِلَسْطِين</span>
              <span>🇵🇸</span>
            </div>
            <p className="text-slate-500 leading-relaxed font-sans max-w-xl mx-auto">
              «وَأَن لَّيْسَ لِلإِنسَانِ إِلَّا مَا سَعَىٰ * وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ» — نسأل الله التوفيق والفتح المبين لكل طالب وطالبة يثابرون في دروب العلم.
            </p>
            <div className="pt-2 text-[11px] text-slate-600 flex items-center justify-center gap-4">
              <span>توقيت القدس الشريف الرسمي</span>
              <span>•</span>
              <span>يعمل بدون إنترنت (PWA)</span>
              <span>•</span>
              <span>الإصدار 2.4</span>
            </div>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
}
