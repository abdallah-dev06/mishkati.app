'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  BookOpen
} from 'lucide-react';
import {
  customEase,
  tapScale,
  subtleTap,
  softSpring
} from '../../lib/animations';
import { usePersona } from '../../context/PersonaContext';

export type TimerMode = 'pomodoro25' | 'pomodoro50' | 'custom' | 'flow';
export type SoundScape = 'none' | 'night' | 'rain' | 'breeze';

export interface FullscreenTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerMode: TimerMode;
  secondsRemaining: number;
  flowSecondsElapsed: number;
  isRunning: boolean;
  ringProgress: number;
  selectedSubject: { id: string; label: string; icon: string };
  soundScape: SoundScape;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onCompleteEarly: () => void;
  onUpdateSoundScape: (sound: SoundScape) => void;
  formatTimeDigits: (sec: number) => string;
}

const SPIRITUAL_REMINDERS = [
  '«وَأَنْ لَيْسَ لِلْإِنْسَانِ إِلَّا مَا سَعَىٰ * وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ»',
  '«اصْبِرْ قَلِيلًا؛ فَمَا هِيَ إِلَّا سَاعَاتٌ وَتَبْلُغُ غَايَتَك»',
  '«يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ»',
  '«قَلِيلٌ دَائِمٌ خَيْرٌ مِنْ كَثِيرٍ مُنْقَطِع»',
  '«وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا»',
  '«إِنَّ مَعَ الْعُسْرِ يُسْرًا»',
  '«وَقُلْ رَبِّ زِدْنِي عِلْمًا»'
];

export default function FullscreenTimerModal({
  isOpen,
  onClose,
  timerMode,
  secondsRemaining,
  flowSecondsElapsed,
  isRunning,
  ringProgress,
  selectedSubject,
  soundScape,
  onToggleTimer,
  onResetTimer,
  onCompleteEarly,
  onUpdateSoundScape,
  formatTimeDigits
}: FullscreenTimerModalProps) {
  const { isMuthabira, t } = usePersona();
  const [isIdle, setIsIdle] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [jerusalemTime, setJerusalemTime] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Live Palestinian Jerusalem clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Date().toLocaleTimeString('ar-PS', {
          timeZone: 'Asia/Jerusalem',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        setJerusalemTime(timeStr);
      } catch {
        const timeStr = new Date().toLocaleTimeString('ar-PS', {
          hour: '2-digit',
          minute: '2-digit'
        });
        setJerusalemTime(timeStr);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Rotate spiritual reminders smoothly
  useEffect(() => {
    if (!isOpen) return;
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % SPIRITUAL_REMINDERS.length);
    }, 18000);
    return () => clearInterval(quoteInterval);
  }, [isOpen]);

  // 3. Monitor native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 4. Native Fullscreen toggle helper
  const toggleNativeFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Native fullscreen toggle error:', err);
    }
  }, []);

  // 5. Exit handler (releases native fullscreen if active, then closes modal)
  const handleExit = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  }, [onClose]);

  // 6. Auto-hide HUD on idle (4 seconds timeout)
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 4000);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsIdle(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    resetIdleTimer();
    const handleActivity = () => resetIdleTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isOpen, resetIdleTimer]);

  // 7. Global Keyboard Shortcuts (F = toggle native fullscreen, Space = toggle timer, Esc = exit)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F' || e.key === 'ب') {
        e.preventDefault();
        toggleNativeFullscreen();
      } else if (e.code === 'Space') {
        e.preventDefault();
        onToggleTimer();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggleTimer, toggleNativeFullscreen, handleExit]);

  const displaySeconds = timerMode === 'flow' ? flowSecondsElapsed : secondsRemaining;
  const timeFormatted = formatTimeDigits(displaySeconds);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="zen-fullscreen-overlay"
          layoutId="focus-timer-container"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: customEase }}
          className={`fixed inset-0 z-[120] bg-[#05070E] flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden transition-all duration-500 ${
            isIdle ? 'cursor-none' : 'cursor-default'
          }`}
          style={{
            direction: 'rtl'
          }}
        >
          {/* Ambient Multi-Layer Radial Glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] sm:w-[680px] h-[540px] sm:h-[680px] ${
            isMuthabira
              ? 'bg-gradient-to-tr from-pink-500/15 via-rose-500/5 to-pink-600/10'
              : 'bg-gradient-to-tr from-amber-500/10 via-emerald-500/5 to-amber-600/10'
          } rounded-full blur-[140px] pointer-events-none transition-all duration-1000 animate-pulse`} />

          {/* ================= 1. FLOATING TOP HUD (Fades on idle) ================= */}
          <div
            className={`relative z-20 w-full flex items-center justify-between gap-4 transition-opacity duration-700 ${
              isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
            }`}
          >
            {/* Right Side: Palestinian Clock & Status Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 border border-amber-500/20 backdrop-blur-md shadow-lg">
                <span className="text-sm">🇵🇸</span>
                <span className="text-xs font-mono font-bold text-amber-300 tracking-wider">
                  {jerusalemTime || 'القدس الشريف'}
                </span>
              </div>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className="font-serif">
                  {timerMode === 'flow' ? 'سيل مفتوح ومستمر' : isRunning ? 'جلسة مذاكرة نشطة' : 'المؤقت متوقف مؤقتاً'}
                </span>
              </div>
            </div>

            {/* Left Side: Audio Ambience & Fullscreen Toggle Buttons */}
            <div className="flex items-center gap-2">
              {/* Soundscape Selector Bar */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-amber-500/20 backdrop-blur-md text-xs">
                {(
                  [
                    { id: 'none', label: 'صامت', icon: '🔕' },
                    { id: 'night', label: 'سكون', icon: '🌙' },
                    { id: 'rain', label: 'مطر', icon: '🌧️' },
                    { id: 'breeze', label: 'نسيم', icon: '🍃' }
                  ] as const
                ).map((snd) => (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => onUpdateSoundScape(snd.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      soundScape === snd.id
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{snd.icon}</span>
                    <span>{snd.label}</span>
                  </button>
                ))}
              </div>

              {/* Native Fullscreen Button */}
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={toggleNativeFullscreen}
                className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-amber-500/20 backdrop-blur-md transition cursor-pointer shadow-md"
                title={isNativeFullscreen ? 'تصغير المتصفح' : 'ملء الشاشة الكاملة (F)'}
              >
                {isNativeFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </motion.button>

              {/* Exit Zen Mode Button */}
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={handleExit}
                className="px-3.5 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-amber-500/25 hover:border-amber-500/50 backdrop-blur-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                title="الخروج من ملء الشاشة (Esc)"
              >
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">إنهاء الخلوة</span>
              </motion.button>
            </div>
          </div>

          {/* ================= 2. ENLARGED FOCAL CENTER DISPLAY ================= */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center px-4">
            
            {/* Active Subject Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 backdrop-blur-md text-xs sm:text-sm font-bold text-amber-300 shadow-xl shadow-black/40 font-serif"
            >
              <span className="text-base">{selectedSubject.icon}</span>
              <span>مذاكرة: {selectedSubject.label}</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-normal">جلسة عمل عميق</span>
            </motion.div>

            {/* Giant SVG Circular Progress Ring framing the Monospace Digits */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] flex items-center justify-center">
              
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_30px_rgba(245,158,11,0.25)]" viewBox="0 0 280 280">
                {/* Background Ring Track */}
                <circle
                  cx="140"
                  cy="140"
                  r="122"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-slate-800/40 fill-transparent"
                />
                {/* Active Glowing Progress Ring */}
                <circle
                  cx="140"
                  cy="140"
                  r="122"
                  stroke="url(#zenGradient)"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 122}
                  strokeDashoffset={2 * Math.PI * 122 * (1 - ringProgress)}
                  strokeLinecap="round"
                  className="fill-transparent transition-all duration-300"
                />
                <defs>
                  <linearGradient id="zenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isMuthabira ? "#f472b6" : "#f59e0b"} />
                    <stop offset="60%" stopColor={isMuthabira ? "#fb7185" : "#fbbf24"} />
                    <stop offset="100%" stopColor={isMuthabira ? "#e11d48" : "#10b981"} />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Digits Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                <span className="font-mono text-6xl sm:text-8xl md:text-9xl font-black text-amber-400 tracking-wider tabular-nums drop-shadow-[0_4px_30px_rgba(245,158,11,0.45)]">
                  {timeFormatted}
                </span>

                <span className="text-xs sm:text-sm text-slate-400 font-mono tracking-widest uppercase">
                  {timerMode === 'flow' ? 'سيل مفتوح' : timerMode === 'pomodoro25' ? 'طريقة 25د' : 'مذاكرة عميقة'}
                </span>
              </div>
            </div>

            {/* Play / Pause / Reset Controls (Beneath Digits) */}
            <div
              className={`mt-8 flex items-center justify-center gap-3.5 transition-opacity duration-700 ${
                isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
              }`}
            >
              {/* Play / Pause Toggle Button */}
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={onToggleTimer}
                className={`px-8 sm:px-10 py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-xl cursor-pointer active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-amber-950/40'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>إيقاف مؤقت</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>بدء التركيز</span>
                  </>
                )}
              </motion.button>

              {/* Reset Button */}
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={onResetTimer}
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
                title="إعادة ضبط المؤقت"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>

              {/* Complete & Save Early Button */}
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={() => {
                  onCompleteEarly();
                  handleExit();
                }}
                className="px-4 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer"
                title="إنهاء الجلسة وحفظ الإنجاز في السجل"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>إنهاء وحفظ</span>
              </motion.button>
            </div>

            {/* Keyboard Shortcuts Hint Bar (fades smoothly on idle) */}
            <div
              className={`mt-4 text-[11px] text-slate-500 font-mono tracking-wide transition-opacity duration-700 ${
                isIdle ? 'opacity-0' : 'opacity-80'
              }`}
            >
              [Space] إيقاف/تشغيل • [F] ملء الشاشة • [Esc] خروج
            </div>
          </div>

          {/* ================= 3. SPIRITUAL & MOTIVATIONAL AMBIENT FOOTER ================= */}
          <div className="relative z-20 w-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto min-h-[48px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.85, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.8, ease: customEase }}
                className="text-xs sm:text-sm font-serif text-slate-400 leading-relaxed tracking-wide select-none"
              >
                {SPIRITUAL_REMINDERS[quoteIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
