'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Clock,
  BookOpen
} from 'lucide-react';
import { tapScale, subtleTap } from '../../lib/animations';
import FullscreenTimerModal, {
  TimerMode,
  SoundScape
} from './FullscreenTimerModal';

export interface SubjectTag {
  id: string;
  label: string;
  icon: string;
}

export interface FocusTimerProps {
  timerMode: TimerMode;
  secondsRemaining: number;
  flowSecondsElapsed: number;
  targetDurationSeconds: number;
  isRunning: boolean;
  ringProgress: number;
  selectedSubject: SubjectTag;
  soundScape: SoundScape;
  onSwitchMode: (mode: TimerMode) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onCompleteEarly: () => void;
  onSelectSubject: (subject: SubjectTag) => void;
  onUpdateSoundScape: (sound: SoundScape) => void;
  formatTimeDigits: (sec: number) => string;
  subjectTags: SubjectTag[];
}

export default function FocusTimer({
  timerMode,
  secondsRemaining,
  flowSecondsElapsed,
  targetDurationSeconds,
  isRunning,
  ringProgress,
  selectedSubject,
  soundScape,
  onSwitchMode,
  onToggleTimer,
  onResetTimer,
  onCompleteEarly,
  onSelectSubject,
  onUpdateSoundScape,
  formatTimeDigits,
  subjectTags
}: FocusTimerProps) {
  const [isZenOpen, setIsZenOpen] = useState(false);

  const displaySeconds = timerMode === 'flow' ? flowSecondsElapsed : secondsRemaining;
  const timeFormatted = formatTimeDigits(displaySeconds);

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 p-6 sm:p-8 shadow-xl shadow-black/40 transition-all duration-300">
        <div className="max-w-2xl mx-auto w-full space-y-7 text-center">
          
          {/* Top Bar: Mode Selector & Ambient Zen Action */}
          <div className="flex items-center justify-between gap-2 flex-wrap border-b border-amber-500/15 pb-4">
            
            {/* Mode Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/70 border border-amber-500/20">
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={() => onSwitchMode('pomodoro25')}
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
                onClick={() => onSwitchMode('pomodoro50')}
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
                onClick={() => onSwitchMode('flow')}
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

            {/* Soundscape & Zen Triggers */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-amber-500/20 text-xs">
                {(['none', 'night', 'rain', 'breeze'] as SoundScape[]).map((snd) => (
                  <button
                    key={snd}
                    type="button"
                    onClick={() => onUpdateSoundScape(snd)}
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

              {/* Zen Fullscreen Trigger Button */}
              <motion.button
                type="button"
                whileTap={tapScale}
                onClick={() => setIsZenOpen(true)}
                className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 transition cursor-pointer shadow-sm flex items-center gap-1.5"
                title="وضع ملء الشاشة الهادئ (Zen View - اضغط F)"
              >
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold hidden sm:inline">ملء الشاشة</span>
              </motion.button>
            </div>

          </div>

          {/* Subject Tag Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium block text-right">
              المادة قيد الإنجاز:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              {subjectTags.map((tag) => {
                const isSelected = selectedSubject.id === tag.id;
                return (
                  <motion.button
                    key={tag.id}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={subtleTap}
                    onClick={() => onSelectSubject(tag)}
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
            
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
              <circle
                cx="120"
                cy="120"
                r="102"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800/80 fill-transparent"
              />
              <circle
                cx="120"
                cy="120"
                r="102"
                stroke="url(#standardTimerGradient)"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 102}
                strokeDashoffset={2 * Math.PI * 102 * (1 - ringProgress)}
                strokeLinecap="round"
                className="fill-transparent transition-all duration-300"
              />
              <defs>
                <linearGradient id="standardTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                {timeFormatted}
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
              onClick={onToggleTimer}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>بدء التركيز</span>
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              whileTap={tapScale}
              onClick={onResetTimer}
              className="p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
              title="إعادة ضبط المؤقت"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileTap={tapScale}
              onClick={onCompleteEarly}
              className="px-4 py-3.5 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="إنهاء الجلسة وحفظ المنجز في السجل الآن"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>إنهاء وحفظ</span>
            </motion.button>
          </div>

        </div>
      </section>

      {/* Fullscreen Zen Ambient Modal */}
      <FullscreenTimerModal
        isOpen={isZenOpen}
        onClose={() => setIsZenOpen(false)}
        timerMode={timerMode}
        secondsRemaining={secondsRemaining}
        flowSecondsElapsed={flowSecondsElapsed}
        isRunning={isRunning}
        ringProgress={ringProgress}
        selectedSubject={selectedSubject}
        soundScape={soundScape}
        onToggleTimer={onToggleTimer}
        onResetTimer={onResetTimer}
        onCompleteEarly={onCompleteEarly}
        onUpdateSoundScape={onUpdateSoundScape}
        formatTimeDigits={formatTimeDigits}
      />
    </>
  );
}
