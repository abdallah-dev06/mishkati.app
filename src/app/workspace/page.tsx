'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  ArrowRight,
  CheckSquare,
  CalendarDays,
  Feather,
  Timer
} from 'lucide-react';
import MidmarArena from '../../components/MidmarArena';
import MutanaffasSection from '../../components/workspace/MutanaffasSection';
import MasarAlShahr from '../../components/workspace/MasarAlShahr';
import MasarAlYawm from '../../components/workspace/MasarAlYawm';

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<'midmar' | 'yawm' | 'masar' | 'mutanaffas'>('midmar');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash === 'mutanaffas') {
        setActiveTab('mutanaffas');
      } else if (hash === 'masar') {
        setActiveTab('masar');
      } else if (hash === 'yawm' || hash === 'masar_yawm') {
        setActiveTab('yawm');
      } else if (hash === 'midmar' || hash === 'workspace') {
        setActiveTab('midmar');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const switchTab = (tab: 'midmar' | 'yawm' | 'masar' | 'mutanaffas') => {
    setActiveTab(tab);
    window.location.hash = '#' + tab;
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient Radial Background Glows */}
      <div className="fixed top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 relative z-10">
        
        {/* Navigation Bar / Back to Home Link */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/15 flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 transition-all text-xs font-bold group shadow-sm"
          >
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            <span>العودة للرئيسية</span>
          </Link>

          {/* Quick Tab Switcher Pills: 1. Midmar, 2. Masar Al-Yawm, 3. Masar Al-Shahr, 4. Mutanaffas */}
          <div className="flex items-center p-1 bg-slate-900/80 rounded-2xl border border-amber-500/20 shadow-inner flex-wrap gap-1">
            <button
              onClick={() => switchTab('midmar')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'midmar'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>مِضْمَارُ الإِنْجَاز</span>
            </button>
            <button
              onClick={() => switchTab('yawm')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'yawm'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>مَسَارُ اليَوْم</span>
            </button>
            <button
              onClick={() => switchTab('masar')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'masar'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>مَسَارُ الشَّهْر</span>
            </button>
            <button
              onClick={() => switchTab('mutanaffas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'mutanaffas'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>مُتَنَفَّس</span>
            </button>
          </div>
        </div>

        {/* ================= 1. PAGE HEADER SHELL ================= */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-amber-500/20 p-6 sm:p-8 shadow-2xl shadow-black/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start gap-4">
              {/* Glowing Target Emblem */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-amber-500/30 via-amber-600/20 to-emerald-950/30 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-xl shadow-amber-950/40 flex-shrink-0">
                <Target className="w-8 h-8 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-serif">
                    مَسَاحَةُ مُـثَـابِـر
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35 text-xs font-bold">
                    الإنتاجية والدراسة
                  </span>
                </div>
                {/* Official Tagline */}
                <p className="text-base sm:text-lg font-serif text-amber-200/90 font-medium">
                  «ثَبَاتٌ عَلَى الدَّرْبِ حَتَّى بُلُوغِ الغَايَة»
                </p>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                  مساحتك المتكاملة لتنظيم مسار دراستك، مواعيد امتحاناتك، وملاذك الآمن للتدوين والفضفضة.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ================= 2. ACTIVE MODULE VIEW ================= */}
        <section className="relative">
          {activeTab === 'midmar' ? (
            <MidmarArena />
          ) : activeTab === 'yawm' ? (
            <MasarAlYawm />
          ) : activeTab === 'masar' ? (
            <MasarAlShahr />
          ) : (
            <MutanaffasSection />
          )}
        </section>

      </main>
    </div>
  );
}
