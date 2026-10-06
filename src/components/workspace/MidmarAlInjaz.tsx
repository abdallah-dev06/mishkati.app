'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Clock,
  Award,
  Calendar,
  Layers,
  BarChart3,
  Share2,
  Copy,
  BookOpen,
  ArrowRight,
  Plus,
  Trash2,
  Sliders,
  Bell,
  Check,
  Compass,
  FileText
} from 'lucide-react';
import {
  customEase,
  tapScale,
  subtleTap,
  burstRingVariants,
  softSpring
} from '../../lib/animations';
import FullscreenTimerModal from './FullscreenTimerModal';
import { usePersona } from '../../context/PersonaContext';

export type TimerMode = 'pomodoro25' | 'pomodoro50' | 'custom' | 'flow';
export type TimerPhase = 'work' | 'shortBreak' | 'longBreak';
export type SoundScape = 'none' | 'night' | 'rain' | 'breeze';

export interface FocusSession {
  id: string;
  durationMinutes: number;
  durationSeconds: number;
  subject: string;
  subjectIcon: string;
  notes: string;
  completedAt: number; // timestamp
  mode: TimerMode;
  dateStr: string; // YYYY-MM-DD
}

export interface StreakMetrics {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalSessionsCompleted: number;
  totalFocusMinutes: number;
  history: Record<string, number>; // dateStr -> minutes
}

export const SUBJECT_TAGS = [
  { id: 'math', label: 'رياضيات وتفاضل', icon: '📐', color: 'from-amber-500 to-amber-600' },
  { id: 'physics', label: 'فيزياء وعلوم', icon: '⚡', color: 'from-blue-500 to-cyan-600' },
  { id: 'coding', label: 'برمجة وحاسوب', icon: '💻', color: 'from-emerald-500 to-teal-600' },
  { id: 'medicine', label: 'مواد طبية وصحية', icon: '🩺', color: 'from-rose-500 to-red-600' },
  { id: 'arabic', label: 'لغة عربية وآداب', icon: '📜', color: 'from-yellow-500 to-amber-600' },
  { id: 'quran', label: 'تلاوة وتثبيت ورد', icon: '📖', color: 'from-emerald-600 to-emerald-800' },
  { id: 'engineering', label: 'هندسة وتصميم', icon: '⚙️', color: 'from-indigo-500 to-purple-600' },
  { id: 'general', label: 'مذاكرة عامة وقراءة', icon: '📚', color: 'from-slate-500 to-slate-700' }
];

export const STREAK_MILESTONES = [
  { days: 3, title: 'شرارة العزم', desc: 'بداية مباركة لغرس عادة المثابرة والاجتهاد', badge: 'عزم 🥉' },
  { days: 7, title: 'شعلة المثابرة', desc: 'أسبوع كامل من الصبر والجلد', badge: 'مثابرة 🥈' },
  { days: 14, title: 'سراج الصمود', desc: 'أسبوعان من التناغم والانضباط', badge: 'صمود 🥇' },
  { days: 30, title: 'منارة الإنجاز', desc: 'شهر راسخ من البناء الأكاديمي', badge: 'منارة 👑' }
];

function getTodayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function MidmarAlInjaz() {
  const { t, isMuthabira, tokens } = usePersona();
  const todayStr = useMemo(() => getTodayKey(), []);

  // Timer State
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro25');
  const [timerPhase, setTimerPhase] = useState<TimerPhase>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [targetDurationSeconds, setTargetDurationSeconds] = useState(25 * 60);
  const [flowSecondsElapsed, setFlowSecondsElapsed] = useState(0);

  // Subject Tagging & Notes
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_TAGS[0]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [pendingCompletedSession, setPendingCompletedSession] = useState<{ durationSeconds: number; mode: TimerMode } | null>(null);

  // Zen / Distraction-free View
  const [isZenMode, setIsZenMode] = useState(false);

  // Audio Ambience using Web Audio API
  const [soundScape, setSoundScape] = useState<SoundScape>('none');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodeRef = useRef<AudioNode | null>(null);

  // Sessions and Streaks
  const [todaySessions, setTodaySessions] = useState<FocusSession[]>([]);
  const [streakMetrics, setStreakMetrics] = useState<StreakMetrics>({
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: todayStr,
    totalSessionsCompleted: 0,
    totalFocusMinutes: 0,
    history: {}
  });

  // End-of-Day Debrief Modal
  const [isDebriefOpen, setIsDebriefOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Global Keyboard shortcut: F to toggle Fullscreen Zen mode when not typing in inputs
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if ((e.key === 'f' || e.key === 'F' || e.key === 'ب') && !isZenMode) {
        e.preventDefault();
        setIsZenMode(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isZenMode]);

  // 1. Initialize data from LocalStorage
  useEffect(() => {
    try {
      // Load streak
      const rawStreak = localStorage.getItem('mishkati_streak_metrics');
      if (rawStreak) {
        const parsed: StreakMetrics = JSON.parse(rawStreak);
        // Check if streak is continuous
        const lastDate = parsed.lastActiveDate;
        const now = new Date();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const yestStr = getTodayKey(yesterday);

        let currentStreak = parsed.currentStreak || 1;
        if (lastDate !== todayStr && lastDate !== yestStr) {
          // Graceful reset
          currentStreak = 1;
        }
        setStreakMetrics({
          ...parsed,
          currentStreak
        });
      }

      // Load today's sessions
      const sessionsKey = `mishkati_focus_sessions_${todayStr}`;
      const rawSessions = localStorage.getItem(sessionsKey);
      if (rawSessions) {
        setTodaySessions(JSON.parse(rawSessions));
      }
    } catch (e) {
      console.error('Error loading Midmar Al-Injaz storage:', e);
    }
  }, [todayStr]);

  // 2. Timer Countdown / Countup Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (timerMode === 'flow') {
          setFlowSecondsElapsed((prev) => prev + 1);
        } else {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              // Timer reached 0
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerMode, targetDurationSeconds]);

  // 3. Mode switching logic
  const switchMode = (mode: TimerMode) => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimerPhase('work');
    setFlowSecondsElapsed(0);

    if (mode === 'pomodoro25') {
      const s = 25 * 60;
      setTargetDurationSeconds(s);
      setSecondsRemaining(s);
    } else if (mode === 'pomodoro50') {
      const s = 50 * 60;
      setTargetDurationSeconds(s);
      setSecondsRemaining(s);
    } else if (mode === 'custom') {
      const s = 40 * 60;
      setTargetDurationSeconds(s);
      setSecondsRemaining(s);
    } else {
      // flow
      setFlowSecondsElapsed(0);
    }
  };

  // 4. Web Audio Synthesizer for 100% Offline Ambience & Bell Chime
  const playBellChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 2.2);
    } catch {
      // Audio not permitted or supported
    }
  };

  const updateSoundScape = (sound: SoundScape) => {
    // Stop current sound
    if (audioNodeRef.current && audioContextRef.current) {
      try {
        (audioNodeRef.current as unknown as { stop: () => void }).stop();
      } catch {}
      audioNodeRef.current = null;
    }

    setSoundScape(sound);
    if (sound === 'none') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (sound === 'night') {
          // Brown noise (softer, deep)
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        } else if (sound === 'rain') {
          // Pink-ish noise
          data[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = data[i];
          data[i] *= 2.8;
        } else {
          // Breeze
          data[i] = white * 0.15;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = sound === 'night' ? 'lowpass' : 'bandpass';
      filter.frequency.value = sound === 'night' ? 400 : 800;

      const gain = ctx.createGain();
      gain.gain.value = 0.08;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      audioNodeRef.current = noise;
    } catch (e) {
      console.warn('Web Audio ambience failed:', e);
    }
  };

  // 5. Timer Completion Event
  const handleTimerComplete = () => {
    setIsRunning(false);
    playBellChime();

    const durationSeconds = timerMode === 'flow' ? flowSecondsElapsed : targetDurationSeconds;
    if (durationSeconds < 60) {
      showToast('جلسة التركيز قصيرة جداً للتسجيل (أقل من دقيقة)');
      return;
    }

    setPendingCompletedSession({
      durationSeconds,
      mode: timerMode
    });
    setIsNotesModalOpen(true);
  };

  // 6. Save Focus Session to Ledger & Update Streak
  const confirmSaveSession = () => {
    if (!pendingCompletedSession) return;

    const durationSeconds = pendingCompletedSession.durationSeconds;
    const durationMinutes = Math.round(durationSeconds / 60);

    const newSession: FocusSession = {
      id: `session_${Date.now()}`,
      durationMinutes,
      durationSeconds,
      subject: selectedSubject.label,
      subjectIcon: selectedSubject.icon,
      notes: sessionNotes.trim() || 'إنجاز مذاكرة مركزة',
      completedAt: Date.now(),
      mode: pendingCompletedSession.mode,
      dateStr: todayStr
    };

    const updatedSessions = [newSession, ...todaySessions];
    setTodaySessions(updatedSessions);

    // Save to LocalStorage
    try {
      localStorage.setItem(`mishkati_focus_sessions_${todayStr}`, JSON.stringify(updatedSessions));
    } catch (e) {
      console.error(e);
    }

    // Update Streak Engine
    const prevHistory = streakMetrics.history || {};
    const todayTotal = (prevHistory[todayStr] || 0) + durationMinutes;
    const updatedHistory = { ...prevHistory, [todayStr]: todayTotal };

    const wasActiveToday = streakMetrics.lastActiveDate === todayStr;
    const newStreak = wasActiveToday ? streakMetrics.currentStreak : streakMetrics.currentStreak + 1;
    const newLongest = Math.max(streakMetrics.longestStreak, newStreak);

    const updatedMetrics: StreakMetrics = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: todayStr,
      totalSessionsCompleted: streakMetrics.totalSessionsCompleted + 1,
      totalFocusMinutes: streakMetrics.totalFocusMinutes + durationMinutes,
      history: updatedHistory
    };

    setStreakMetrics(updatedMetrics);
    try {
      localStorage.setItem('mishkati_streak_metrics', JSON.stringify(updatedMetrics));
    } catch (e) {
      console.error(e);
    }

    // Dispatch global event for dashboard auto-sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mishkati_focus_updated', {
          detail: { totalMinutes: todayTotal, sessionCount: updatedSessions.length }
        })
      );
    }

    // Cleanup & Toast
    setIsNotesModalOpen(false);
    setSessionNotes('');
    setPendingCompletedSession(null);
    setFlowSecondsElapsed(0);
    if (timerMode !== 'flow') {
      setSecondsRemaining(targetDurationSeconds);
    }
    showToast(`بورك السعي! أُضيفت ${durationMinutes} دقيقة إنجاز إلى مضمارك 🎯`);
  };

  // Format Helper
  const formatTimeDigits = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress Percentage for Circular Ring
  const ringProgress = useMemo(() => {
    if (timerMode === 'flow') {
      // 1 hour loop or continuous
      return (flowSecondsElapsed % 3600) / 3600;
    }
    if (targetDurationSeconds === 0) return 0;
    return (targetDurationSeconds - secondsRemaining) / targetDurationSeconds;
  }, [timerMode, flowSecondsElapsed, secondsRemaining, targetDurationSeconds]);

  // Aggregate Metrics for Ledger
  const todayTotalMinutes = useMemo(() => {
    return todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [todaySessions]);

  const longestSessionMinutes = useMemo(() => {
    if (todaySessions.length === 0) return 0;
    return Math.max(...todaySessions.map((s) => s.durationMinutes));
  }, [todaySessions]);

  // Streak Level Title
  const activeMilestone = useMemo(() => {
    const d = streakMetrics.currentStreak;
    if (d >= 30) return STREAK_MILESTONES[3];
    if (d >= 14) return STREAK_MILESTONES[2];
    if (d >= 7) return STREAK_MILESTONES[1];
    return STREAK_MILESTONES[0];
  }, [streakMetrics.currentStreak]);

  // Copy Daily Scorecard Text
  const copyScorecard = () => {
    const lines = [
      `🌟 حَصَادُ مِضْمَارِ الإِنْجَاز - مِشكاتي 🕯️`,
      `📅 تاريخ: ${new Date().toLocaleDateString('ar-PS')}`,
      `🎯 عقد الهمة: ${streakMetrics.currentStreak} أيام متواصلة (${activeMilestone.title})`,
      `⏱️ مجموع ساعات المذاكرة والإنجاز اليوم: ${(todayTotalMinutes / 60).toFixed(1)} ساعة (${todayTotalMinutes} دقيقة)`,
      `🎯 عدد الجلسات المنجزة: ${todaySessions.length} جلسة`,
      `---------------------------------`,
      ...todaySessions.map((s, idx) => `${idx + 1}. [${s.subject}] ${s.durationMinutes}د: ${s.notes}`),
      `---------------------------------`,
      t(
        '«بُورِكَتِ الأَنْفَاسُ وَسَاعَاتُ السَّعْيِ، رَفَعَ اللهُ قَدْرَكَ بِمَا حَصَّلْتَ اليَوْم»',
        '«بُورِكَتِ الأَنْفَاسُ وَسَاعَاتُ السَّعْيِ، رَفَعَ اللهُ قَدْرَكِ بِمَا حَصَّلْتِ اليَوْم»'
      )
    ];
    const text = lines.join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('تم نسخ بطاقة الحصاد للمشاركة بنجاح 📋');
    }
  };

  return (
    <div id="midmarAlInjazSection" className="space-y-6 select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="bg-slate-900/95 border border-amber-500/40 text-amber-200 px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2">
            <span>🕯️</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ================= 1. HEADER & THE FLAME STREAK ENGINE ================= */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/25 p-5 sm:p-7 shadow-xl shadow-black/40">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Identity & Tagline */}
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              {/* Luminous Breathing Target Halo */}
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.35, 0.75, 0.35]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 rounded-2xl bg-amber-500/30 blur-md -z-10 pointer-events-none"
              />
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 via-amber-600/20 to-emerald-950/40 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/40">
                <Target className="w-8 h-8 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)] text-amber-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 font-serif tracking-tight">
                  مِضْمَارُ الإِنْجَاز
                </h1>
                <span className="text-[11px] px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-serif font-bold tracking-wide">
                  سَاحَةُ الهِمَّةِ وَالمُثَابَرَة
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                  {activeMilestone.badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-serif leading-relaxed">
                «حَيْثُ يُصْنَعُ الفَرْقُ بِسَاعَاتِ الصَّبْرِ وَالجَلَد»
              </p>
            </div>
          </div>

          {/* Pillar A: عداد الحماسة والاستمرارية (Streak Momentum Engine) */}
          <div className="flex items-center gap-3 bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-amber-500/25 shadow-inner">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono font-black text-lg shadow-sm">
                {streakMetrics.currentStreak}
              </div>
            </div>

            <div className="min-w-0 text-right space-y-0.5">
              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <span>عِقْدُ الهِمَّةِ المُتَوَاصِل</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <div className="text-xs font-bold text-slate-100 font-mono">
                {streakMetrics.currentStreak} {streakMetrics.currentStreak === 1 ? 'يوم' : streakMetrics.currentStreak === 2 ? 'يومان' : 'أيام'} من المثابرة
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                المحطة: {activeMilestone.title} • الرقم القياسي: {streakMetrics.longestStreak}د
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 2. PILLAR B: DEEP WORK & FOCUS TIMER ================= */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 p-6 sm:p-8 shadow-xl shadow-black/40 transition-all duration-300">
        <div className="max-w-2xl mx-auto w-full space-y-7 text-center">
          
          {/* Top Bar: Mode Selector & Zen Trigger */}
          <div className="flex items-center justify-between gap-2 flex-wrap border-b border-amber-500/15 pb-4">
            
            {/* Mode Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/70 border border-amber-500/20">
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={() => switchMode('pomodoro25')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  timerMode === 'pomodoro25'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                طريقة 25د
              </motion.button>
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={() => switchMode('pomodoro50')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  timerMode === 'pomodoro50'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                تعمّق 50د
              </motion.button>
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={() => switchMode('flow')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  timerMode === 'flow'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>السيل المفتوح</span>
                <span className="text-[10px]">🌊</span>
              </motion.button>
            </div>

            {/* Ambience & Zen Controls */}
            <div className="flex items-center gap-2">
              {/* Soundscape Selector */}
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-amber-500/20 text-xs">
                {(['none', 'night', 'rain', 'breeze'] as SoundScape[]).map((snd) => (
                  <button
                    key={snd}
                    type="button"
                    onClick={() => updateSoundScape(snd)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      soundScape === snd
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {snd === 'none' ? 'صامت' : snd === 'night' ? 'سكون 🌙' : snd === 'rain' ? 'مطر 🌧️' : 'نسيم 🍃'}
                  </button>
                ))}
              </div>

              {/* Zen Fullscreen Toggle */}
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={() => setIsZenMode(true)}
                className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 transition cursor-pointer shadow-sm flex items-center gap-1.5"
                title="وضع ملء الشاشة الهادئ (Zen View - اضغط F)"
              >
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold hidden sm:inline">ملء الشاشة</span>
              </motion.button>
            </div>

          </div>

          {/* Subject Tag Selector Strip */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium block text-right">
              المادة قيد الإنجاز:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              {SUBJECT_TAGS.map((tag) => {
                const isSelected = selectedSubject.id === tag.id;
                return (
                  <motion.button
                    key={tag.id}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={subtleTap}
                    onClick={() => setSelectedSubject(tag)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/30'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-amber-500/30'
                    }`}
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* CIRCULAR PROGRESS RING & MONOSPACE TIME DISPLAY */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
            
            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
              {/* Background Track */}
              <circle
                cx="120"
                cy="120"
                r="102"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800/80 fill-transparent"
              />
              {/* Progress Indicator with Gradient */}
              <circle
                cx="120"
                cy="120"
                r="102"
                stroke="url(#timerGradient)"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 102}
                strokeDashoffset={2 * Math.PI * 102 * (1 - ringProgress)}
                strokeLinecap="round"
                className="fill-transparent transition-all duration-300"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
              <span className="text-xs text-amber-300/80 font-bold flex items-center gap-1 font-serif">
                <span>{selectedSubject.icon}</span>
                <span>{selectedSubject.label}</span>
              </span>

              <div className="font-mono text-4xl sm:text-5xl font-black text-slate-100 tracking-wider tabular-nums drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)]">
                {timerMode === 'flow'
                  ? formatTimeDigits(flowSecondsElapsed)
                  : formatTimeDigits(secondsRemaining)}
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                {timerMode === 'flow' ? 'سيل مفتوح ومستمر' : isRunning ? 'جلسة تركيز نشطة' : 'جاهز للانطلاق'}
              </div>
            </div>

          </div>

          {/* PLAY / PAUSE / RESET CONTROLS */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <motion.button
              type="button"
              whileTap={tapScale}
              onClick={() => {
                if (timerMode === 'flow') {
                  setFlowSecondsElapsed(0);
                } else {
                  setSecondsRemaining(targetDurationSeconds);
                }
                setIsRunning(false);
              }}
              className="p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition cursor-pointer"
              title="إعادة ضبط المؤقت"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={tapScale}
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 sm:px-10 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xl transition cursor-pointer ${
                isRunning
                  ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 hover:from-amber-400 hover:to-amber-500 font-black shadow-amber-950/40'
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
                  <span>ابدأ التركيز</span>
                </>
              )}
            </motion.button>

            {/* Complete Early Button */}
            <motion.button
              type="button"
              whileTap={tapScale}
              onClick={handleTimerComplete}
              className="p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
              title="إنهاء الجلسة وتسجيل الإنجاز"
            >
              <CheckCircle2 className="w-5 h-5" />
            </motion.button>
          </div>

        </div>
      </section>

      {/* Fullscreen Zen Ambient Modal */}
      <FullscreenTimerModal
        isOpen={isZenMode}
        onClose={() => setIsZenMode(false)}
        timerMode={timerMode}
        secondsRemaining={secondsRemaining}
        flowSecondsElapsed={flowSecondsElapsed}
        isRunning={isRunning}
        ringProgress={ringProgress}
        selectedSubject={selectedSubject}
        soundScape={soundScape}
        onToggleTimer={() => setIsRunning(!isRunning)}
        onResetTimer={() => {
          if (timerMode === 'flow') {
            setFlowSecondsElapsed(0);
          } else {
            setSecondsRemaining(targetDurationSeconds);
          }
          setIsRunning(false);
        }}
        onCompleteEarly={handleTimerComplete}
        onUpdateSoundScape={updateSoundScape}
        formatTimeDigits={formatTimeDigits}
      />

      {/* ================= 3. PILLAR C: HOURLY STUDY LEDGER & TIME TRACKING ================= */}
      <section className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 p-5 sm:p-7 shadow-xl shadow-black/40 space-y-6">
        
        {/* Header & Cumulative Counters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/15 pb-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-100 font-serif flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>سِجِلُّ تَفْصِيلِ السَّاعَاتِ وَحَصَادِ الجُهْد</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              توثيق كتل الإنجاز بساعاتها ودقائقها على مدار الـ 24 ساعة
            </p>
          </div>

          {/* Cumulative Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-950/70 px-3.5 py-1.5 rounded-xl border border-amber-500/20 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">مجموع اليوم</span>
              <span className="font-mono text-sm font-bold text-amber-300">
                {(todayTotalMinutes / 60).toFixed(1)} س ({todayTotalMinutes}د)
              </span>
            </div>

            <div className="bg-slate-950/70 px-3.5 py-1.5 rounded-xl border border-amber-500/20 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">الجلسات المكتملة</span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {todaySessions.length} جلسة
              </span>
            </div>

            {/* End of Day Debrief Trigger */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={tapScale}
              onClick={() => setIsDebriefOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/25 to-amber-600/15 border border-amber-500/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>خِتَامُ الحَصَاد</span>
              <span>📜</span>
            </motion.button>
          </div>
        </div>

        {/* Sessions Timeline List */}
        <div className="space-y-3">
          {todaySessions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs space-y-2 border border-dashed border-amber-500/15 rounded-2xl p-4">
              <span className="text-3xl block opacity-40">⏱️</span>
              <p className="font-bold text-slate-400">المضمار مهيأ بانتظار أولى جلساتك اليوم.</p>
              <p className="text-[11px] text-slate-500">
                شغّل المؤقت أعلاه وأتمم جلستك لتدوين أول كتلة إنجاز في سجلك اليومي.
              </p>
            </div>
          ) : (
            todaySessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: customEase }}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/20 hover:border-amber-500/40 transition flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {session.subjectIcon}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-100 font-serif">
                        {session.subject}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                        {session.durationMinutes} دقيقة
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(session.completedAt).toLocaleTimeString('ar-PS', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {session.notes}
                    </p>
                  </div>
                </div>

                {/* Delete session button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('هل ترغب في حذف هذه الجلسة من سجل اليوم؟')) {
                      const updated = todaySessions.filter((s) => s.id !== session.id);
                      setTodaySessions(updated);
                      try {
                        localStorage.setItem(`mishkati_focus_sessions_${todayStr}`, JSON.stringify(updated));
                      } catch {}
                      showToast('تم حذف الجلسة من السجل');
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  title="حذف الجلسة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))
          )}
        </div>

      </section>

      {/* ================= MODAL: NOTES & CONFIRM SESSION ================= */}
      <AnimatePresence>
        {isNotesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={softSpring}
              className="w-full max-w-md rounded-3xl bg-[#0A0F1D] border border-amber-500/40 p-6 space-y-5 shadow-2xl text-right"
            >
              <div className="flex items-center gap-3 border-b border-amber-500/20 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg">
                  {selectedSubject.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100 font-serif">
                    توثيق كتلة الإنجاز
                  </h3>
                  <p className="text-[11px] text-amber-300/80 font-mono">
                    المدة المنجزة: {pendingCompletedSession ? Math.round(pendingCompletedSession.durationSeconds / 60) : 0} دقيقة
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium block">
                  ماذا أنجزت خلال هذه الجلسة المباركة؟
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="مثال: حل 20 مسألة تفاضل + تلخيص الوحدة الثانية..."
                  rows={3}
                  className="w-full bg-slate-900 border border-amber-500/30 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <motion.button
                  type="button"
                  whileTap={tapScale}
                  onClick={() => {
                    setIsNotesModalOpen(false);
                    setPendingCompletedSession(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold transition hover:bg-slate-700"
                >
                  إلغاء
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={tapScale}
                  onClick={confirmSaveSession}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition"
                >
                  حفظ وتثبيت الإنجاز ✓
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: PILLAR D - END-OF-DAY EXECUTIVE DEBRIEF ================= */}
      <AnimatePresence>
        {isDebriefOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={softSpring}
              className="w-full max-w-lg rounded-3xl bg-[#0A0F1D] border-2 border-amber-500/40 p-6 sm:p-7 space-y-6 shadow-2xl text-right max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="text-center space-y-1.5 border-b border-amber-500/20 pb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 text-xl mx-auto shadow-inner">
                  🕯️
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-slate-100">
                  خِتَامُ الحَصَادِ وَإِغْلَاقُ اليَوْم
                </h3>
                <p className="text-xs text-amber-300/80 font-serif">
                  {t('بطاقة الحصاد التنفيذية لطالب فلسطين المباركة', 'بطاقة الحصاد التنفيذية لطالبة فلسطين المباركة')}
                </p>
              </div>

              {/* Day Scorecard Metrics */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20">
                  <span className="text-[10px] text-slate-400 block font-medium">ساعات التركيز</span>
                  <span className="text-xl sm:text-2xl font-mono font-bold text-amber-300">
                    {(todayTotalMinutes / 60).toFixed(1)} س
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20">
                  <span className="text-[10px] text-slate-400 block font-medium">عقد الهمة</span>
                  <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
                    {streakMetrics.currentStreak} أيام
                  </span>
                </div>
              </div>

              {/* Spiritual Motivational Stamp */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-950/30 to-amber-500/10 border border-amber-500/30 text-center space-y-1 shadow-inner">
                <div className="text-sm sm:text-base font-serif font-black text-amber-100 leading-relaxed">
                  {t('«بُورِكَتِ الأَنْفَاسُ وَسَاعَاتُ السَّعْيِ، رَفَعَ اللهُ قَدْرَكَ بِمَا حَصَّلْتَ اليَوْم»', '«بُورِكَتِ الأَنْفَاسُ وَسَاعَاتُ السَّعْيِ، رَفَعَ اللهُ قَدْرَكِ بِمَا حَصَّلْتِ اليَوْم»')}
                </div>
                <p className="text-[10px] text-slate-400 font-serif">
                  {t('نم قرير العين واستأنف عزيمتك مع إشراقة فجر الغد', 'نامي قريرة العين واستأنفي عزيمتكِ مع إشراقة فجر الغد')}
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                <motion.button
                  type="button"
                  whileTap={tapScale}
                  onClick={copyScorecard}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>نسخ بطاقة الحصاد</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={tapScale}
                  onClick={() => setIsDebriefOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  إغلاق النافذة
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
