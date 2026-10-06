'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealContainer } from './ui/ScrollReveal';
import { streakFlameRadiantVariants } from '@/lib/scrollAnimations';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Award,
  Maximize2,
  Minimize2,
  CheckCircle,
  Clock,
  BookOpen,
  Calendar
} from 'lucide-react';

interface MidmarSubject {
  id: string;
  label: string;
  icon: string;
}

const MIDMAR_SUBJECTS: MidmarSubject[] = [
  { id: 'math', label: 'رياضيات وتفاضل', icon: '📐' },
  { id: 'physics', label: 'فيزياء وعلوم', icon: '⚡' },
  { id: 'coding', label: 'برمجة وحاسوب', icon: '💻' },
  { id: 'medicine', label: 'مواد طبية وصحية', icon: '🩺' },
  { id: 'arabic', label: 'لغة عربية وآداب', icon: '📜' },
  { id: 'quran', label: 'تلاوة وتثبيت ورد', icon: '📖' },
  { id: 'engineering', label: 'هندسة وتصميم', icon: '⚙️' },
  { id: 'general', label: 'مذاكرة عامة وقراءة', icon: '📚' }
];

interface TimelineSessionItem {
  id: string;
  goal: string;
  subject: string;
  icon: string;
  durationMinutes: number;
  timeStr: string;
  notes: string;
}

const SAMPLE_TIMELINE_SESSIONS: TimelineSessionItem[] = [
  {
    id: 's1',
    goal: 'حل 12 مسألة في التكامل بالتعويض',
    subject: 'رياضيات وتفاضل',
    icon: '📐',
    durationMinutes: 50,
    timeStr: '02:15 م',
    notes: 'تم استيعاب فكرة تغيير الحدود بدقة وتثبيت حل أسئلة الكتاب الوزاري.'
  },
  {
    id: 's2',
    goal: 'مراجعة وتلخيص الفصل الثاني في الكهرباء الساكنة',
    subject: 'فيزياء وعلوم',
    icon: '⚡',
    durationMinutes: 45,
    timeStr: '11:30 ص',
    notes: 'إنشاء خريطة ذهنية لقوانين كولوم والمجال الكهربائي المتولد.'
  },
  {
    id: 's3',
    goal: 'كتابة مكونات واجهة المستخدم وتجربة الحركات التفاعلية',
    subject: 'برمجة وحاسوب',
    icon: '💻',
    durationMinutes: 30,
    timeStr: '09:40 ص',
    notes: 'إتمام مكتبة أنيميشن التمرير السلس Scroll Reveal واختبارها.'
  }
];

export const MidmarArena: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<MidmarSubject>(MIDMAR_SUBJECTS[0]);
  const [customGoal, setCustomGoal] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isZen, setIsZen] = useState(false);
  const [sound, setSound] = useState<'none' | 'night' | 'rain' | 'breeze'>('none');
  const [jerusalemTime, setJerusalemTime] = useState('');

  const displayGoal = customGoal.trim() || selectedSubject.label;

  const totalDuration = 25 * 60;
  const progress = (totalDuration - secondsRemaining) / totalDuration;
  const normalOffset = Math.max(0, 753.98 - progress * 753.98);
  const zenOffset = Math.max(0, 766.55 - progress * 766.55);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Live Jerusalem Clock for Zen Mode
  useEffect(() => {
    if (!isZen) return;
    const updateTime = () => {
      try {
        setJerusalemTime(
          new Date().toLocaleTimeString('ar-PS', {
            timeZone: 'Asia/Jerusalem',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })
        );
      } catch (e) {
        setJerusalemTime(new Date().toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' }));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isZen]);

  // Toggle Zen & Native Fullscreen API
  const toggleZen = () => {
    setIsZen((prev) => !prev);
  };

  // Fullscreen, Overflow control, and multi-vendor listeners
  useEffect(() => {
    if (isZen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      try {
        const doc = document as any;
        const fsElem = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
        if (!fsElem) {
          const docEl = document.documentElement as any;
          const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
          if (req) {
            req.call(docEl).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('Native fullscreen request:', e);
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      try {
        const doc = document as any;
        const fsElem = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
        const exitFs = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        if (fsElem && exitFs) {
          exitFs.call(doc).catch(() => {});
        }
      } catch (e) {
        console.warn('Native fullscreen exit:', e);
      }
    }
  }, [isZen]);

  // Keyboard Shortcuts: [F] Fullscreen, [Space] Play/Pause, [Esc] Exit Zen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;

      if (e.key === 'f' || e.key === 'F' || e.key === 'ب') {
        e.preventDefault();
        toggleZen();
      } else if (e.code === 'Space') {
        if (isZen) {
          e.preventDefault();
          setIsRunning((prev) => !prev);
        }
      } else if (e.key === 'Escape') {
        if (isZen) {
          e.preventDefault();
          toggleZen();
        }
      }
    };

    const handleFullscreenChange = () => {
      const doc = document as any;
      const fsElem = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
      if (!fsElem && isZen) {
        setIsZen(false);
      }
    };

    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach((evt) => document.addEventListener(evt, handleFullscreenChange));
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      events.forEach((evt) => document.removeEventListener(evt, handleFullscreenChange));
    };
  }, [isZen]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Section Header with Fade-Up */}
      <ScrollReveal variant="fadeUp" className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-xs font-bold text-amber-300 mb-3 shadow-md">
          <span>⏱️</span>
          <span>مِضْمَارُ الإِنْجَاز</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-100 font-serif mb-2">
          ميدان التركيز الصافي وتوثيق ساعات السعي
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
          جلسات تركيز عميقة بنظام بومودورو أو السيل الحر، خالية من المشتتات، تثبّت أهدافك وتخلّد مسيرتك.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT/MAIN COLUMN (Timer Canvas & Goal Definition) */}
        <div className="lg:col-span-7 space-y-6">
          <ScrollReveal variant="glowBorder">
            <div className="rounded-3xl bg-slate-900/80 border border-amber-500/20 backdrop-blur-xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
              {/* Top Bar with Streak Flame & Zen Trigger */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
                {/* Radiant Streak Flame */}
                <div className="flex items-center gap-3">
                  <motion.div
                    variants={streakFlameRadiantVariants}
                    initial="hidden"
                    whileInView={['visible', 'pulse']}
                    viewport={{ once: true, amount: 0.3 }}
                    className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl text-amber-400 shadow-lg"
                  >
                    🔥
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-base font-black text-amber-300 font-serif">عَقْدُ الهِمَّة: 7 أيام متواصلة</span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/35 text-amber-200">
                        شعلة المثابرة 🥈
                      </span>
                    </div>
                    <span className="text-xs text-slate-300">14.5 ساعة تركيز هذا الأسبوع</span>
                  </div>
                </div>

                {/* Zen Button */}
                <button
                  type="button"
                  onClick={toggleZen}
                  className="px-3.5 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 shadow-sm"
                  title="وضع التركيز (ملء الشاشة [F])"
                >
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">وضع التركيز (ملء الشاشة)</span>
                </button>
              </div>

              {/* Goal Input Field */}
              <div className="space-y-2.5 mb-6 text-right">
                <div className="flex items-center justify-between text-xs font-bold">
                  <label htmlFor="midmarGoalInputReact" className="text-slate-200 flex items-center gap-1.5">
                    <span className="text-amber-400">🎯</span>
                    <span>ماذا تود أن تنجز في هذه الجلسة يا مثابر؟</span>
                  </label>
                  <span className="text-amber-300 font-bold truncate max-w-[200px]">
                    {selectedSubject.icon} {displayGoal}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="midmarGoalInputReact"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="اكتب هدفك المحدد هنا... (مثال: حل 10 مسائل تفاضل، تلخيص الوحدة الثانية)"
                    className="w-full bg-slate-950/80 border border-amber-500/25 hover:border-amber-500/40 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition shadow-inner font-sans"
                  />
                </div>
              </div>

              {/* Timer Progress Ring & Display */}
              <div className="relative py-4 flex flex-col items-center justify-center">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
                    <circle
                      cx="140"
                      cy="140"
                      r="120"
                      fill="transparent"
                      stroke="rgba(30, 41, 59, 0.7)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="140"
                      cy="140"
                      r="120"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="12"
                      strokeDasharray="753.98"
                      strokeDashoffset={normalOffset}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  </svg>

                  {/* Inside Digital Clock */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl sm:text-5xl font-mono font-black text-slate-100 tracking-wider">
                      {timeFormatted}
                    </span>
                    <span className="text-xs text-amber-300 font-bold mt-1 max-w-[180px] truncate">
                      {selectedSubject.icon} {displayGoal}
                    </span>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsRunning(!isRunning)}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                    <span>{isRunning ? 'إيقاف مؤقت' : 'بدء التركيز'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRunning(false);
                      setSecondsRemaining(25 * 60);
                    }}
                    className="p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
                    title="إعادة ضبط المؤقت"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* RIGHT COLUMN: Hourly Timeline / Study Ledger */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <ScrollReveal variant="fadeUp" delay={0.15}>
            <div className="rounded-3xl bg-slate-900/80 border border-amber-500/20 backdrop-blur-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm sm:text-base font-black text-slate-100 font-serif">سجل الإنجاز وساعات السعي</h3>
                </div>
                <span className="text-xs text-amber-300 font-mono font-bold">اليوم: 2.1 ساعة</span>
              </div>

              {/* Progressively Animated Timeline Entries */}
              <ScrollRevealContainer staggerChildren={0.08} delayChildren={0.1} className="space-y-3">
                {SAMPLE_TIMELINE_SESSIONS.map((session, idx) => (
                  <ScrollReveal key={session.id} variant="fadeUp" delay={idx * 0.08}>
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/15 hover:border-amber-500/35 transition-all duration-200 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                          {session.icon}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-100">{session.goal}</span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-amber-300 font-semibold">
                              {session.subject}
                            </span>
                            <span className="text-xs text-slate-300 font-mono">{session.timeStr}</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed font-sans">{session.notes}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          {session.durationMinutes}د
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </ScrollRevealContainer>
            </div>
          </ScrollReveal>
        </div>

      </div>

      {/* ================= FULLSCREEN ZEN FOCUS MODE OVERLAY ================= */}
      {isZen && (
        <div
          className="fixed inset-0 w-screen h-screen z-[99999] bg-[#060913] flex flex-col justify-between p-6 sm:p-8 select-none overflow-hidden transition-all duration-300"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            backgroundColor: '#060913'
          }}
          dir="rtl"
        >
          {/* Ambient Multi-Layer Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] sm:w-[720px] h-[540px] sm:h-[720px] bg-gradient-to-tr from-amber-500/10 via-emerald-500/5 to-amber-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

          {/* 1. FLOATING TOP HUD (Balanced: Right, Center, Left) */}
          <div className="relative z-20 w-full flex items-center justify-between gap-4 transition-opacity duration-700 opacity-100 flex-wrap sm:flex-nowrap">
            {/* Right Side: Palestinian Clock & Status */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 border border-amber-500/25 backdrop-blur-md shadow-lg text-slate-100">
                <span className="text-sm">🇵🇸</span>
                <span className="text-xs font-mono font-bold text-amber-300 tracking-wider">
                  {jerusalemTime || 'القدس الشريف'}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/70 border border-amber-500/20 backdrop-blur-md text-xs text-slate-200">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className="font-serif font-semibold">{isRunning ? 'جلسة تركيز نشطة' : 'المؤقت متوقف مؤقتاً'}</span>
              </div>
            </div>

            {/* Center: Active Subject & Goal Badge */}
            <div className="order-3 sm:order-2 mx-auto sm:mx-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 backdrop-blur-md text-xs sm:text-sm font-bold text-amber-300 shadow-xl shadow-black/40 font-serif">
              <span>{selectedSubject.icon} {displayGoal}</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-normal">جلسة تركيز عميق</span>
            </div>

            {/* Left Side: Audio Ambience Toggles & Exit Zen Button */}
            <div className="order-2 sm:order-3 flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-amber-500/20 backdrop-blur-md text-xs">
                <button
                  type="button"
                  onClick={() => setSound('none')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    sound === 'none'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔕 صامت
                </button>
                <button
                  type="button"
                  onClick={() => setSound('rain')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    sound === 'rain'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌧️ مطر
                </button>
                <button
                  type="button"
                  onClick={() => setSound('night')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    sound === 'night'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌙 سكون
                </button>
                <button
                  type="button"
                  onClick={() => setSound('breeze')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    sound === 'breeze'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🍃 نسيم
                </button>
              </div>

              {/* Exit Zen Button */}
              <button
                type="button"
                onClick={toggleZen}
                className="px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-amber-500/30 hover:border-amber-400 backdrop-blur-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                title="الخروج من وضع التركيز (Esc أو F)"
              >
                <Minimize2 className="w-4 h-4 text-amber-400" />
                <span>إنهاء وضع التركيز</span>
              </button>
            </div>
          </div>

          {/* 2. ENLARGED FOCAL CENTER DISPLAY */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center px-4">
            <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px] xl:w-[520px] xl:h-[520px] flex items-center justify-center">
              {/* Ambient Radial Glow Backdrop */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)' }}
              />

              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_35px_rgba(245,158,11,0.25)]" viewBox="0 0 280 280">
                <circle
                  cx="140"
                  cy="140"
                  r="122"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-800/40 fill-transparent"
                />
                <circle
                  cx="140"
                  cy="140"
                  r="122"
                  stroke="url(#midmarZenGradReact)"
                  strokeWidth="7"
                  strokeDasharray="766.55"
                  strokeDashoffset={zenOffset}
                  strokeLinecap="round"
                  className="fill-transparent transition-all duration-300"
                />
                <defs>
                  <linearGradient id="midmarZenGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="60%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Digits & Arabic Descriptor */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 select-none">
                <div className="font-mono text-7xl sm:text-8xl md:text-9xl font-bold text-amber-400 tracking-wider tabular-nums drop-shadow-[0_4px_30px_rgba(245,158,11,0.45)]">
                  {timeFormatted}
                </div>
                <span className="text-sm sm:text-base text-slate-300 font-sans tracking-wide">
                  طريقة 25 د
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center justify-center gap-3.5 transition-opacity duration-700 opacity-100 flex-wrap">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className="px-8 sm:px-10 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base transition cursor-pointer flex items-center gap-2.5 active:scale-95 shadow-xl shadow-amber-950/60"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950" />}
                <span>{isRunning ? 'إيقاف مؤقت' : 'بدء التركيز'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  setSecondsRemaining(25 * 60);
                }}
                title="إعادة ضبط المؤقت"
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  toggleZen();
                }}
                className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-emerald-950/50 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>إنهاء وحفظ</span>
              </button>
            </div>

            {/* Keyboard Shortcuts Hint Bar */}
            <div className="mt-5 text-xs text-slate-300 font-mono tracking-wide transition-opacity duration-700 opacity-90">
              [Space] إيقاف/تشغيل • [F] ملء الشاشة • [Esc] خروج
            </div>
          </div>

          {/* 3. SPIRITUAL FOOTER */}
          <div className="relative z-20 w-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto min-h-[48px]">
            <p className="text-xs sm:text-sm font-serif text-slate-400 leading-relaxed tracking-wide select-none">
              «وَأَنْ لَيْسَ لِلْإِنْسَانِ إِلَّا مَا سَعَىٰ * وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ»
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default MidmarArena;
