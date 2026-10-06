'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, Feather, CalendarDays, ArrowLeft, Plus, ShieldCheck } from 'lucide-react';

interface MuthabirGlanceHubProps {
  completedHabitsCount?: number;
  totalHabitsCount?: number;
  upcomingEventTitle?: string;
  upcomingEventDate?: string;
  upcomingEventCategory?: string;
  onNavigate?: (route: string) => void;
}

export default function MuthabirGlanceHub({
  completedHabitsCount = 4,
  totalHabitsCount = 7,
  upcomingEventTitle = 'امتحان الفيزياء الوزاري التجريبي',
  upcomingEventDate = '2026-10-12',
  upcomingEventCategory = 'امتحان / اختبار',
  onNavigate
}: MuthabirGlanceHubProps) {
  const habitsPct = Math.round((completedHabitsCount / totalHabitsCount) * 100);

  return (
    <section aria-label="لمحة مساحة مثابر التنفيذية" className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/15 pb-2.5">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 font-serif flex items-center gap-2">
            <span>🎯</span>
            <span>«مساحة مُثابِر» • لمحة الإنجاز والمسار</span>
          </h3>
          <p className="text-xs text-slate-400">
            نظرة سريعة على مسار يومك، أهدافك الدراسية، وملاذك الهادئ
          </p>
        </div>

        <Link
          href="/#muthabir"
          onClick={() => onNavigate && onNavigate('muthabir')}
          className="text-xs font-bold text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition flex items-center gap-1 cursor-pointer"
        >
          <span>فتح المساحة كاملة</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3 Executive Glance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Quick Daily Tasks Preview ("مَسَارُ اليَوْم") */}
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 p-5 shadow-xl shadow-black/40 flex flex-col justify-between space-y-4 hover:border-amber-500/35 transition group">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center text-base shadow-inner">
                <CheckSquare className="w-4 h-4 text-amber-400" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                اليوم
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100 font-serif">مَسَارُ اليَوْم</h4>
              <p className="text-xs text-amber-300 font-mono font-bold mt-1">
                أنجزت {completedHabitsCount} من {totalHabitsCount} أهداف اليوم ({habitsPct}%)
              </p>
            </div>

            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${habitsPct}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <Link
              href="/#masar_yawm"
              onClick={() => onNavigate && onNavigate('masar_yawm')}
              className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مهمة سريعة</span>
            </Link>
            <span className="text-[10px] text-slate-500 font-sans">محطاتك الثابتة محفوظة</span>
          </div>
        </div>

        {/* Card 2: Emotional Safe Haven Card ("مُتَنَفَّس") */}
        <Link
          href="/#mutanaffas"
          onClick={() => onNavigate && onNavigate('mutanaffas')}
          className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 p-5 shadow-xl shadow-black/40 flex flex-col justify-between space-y-4 hover:border-emerald-500/35 transition cursor-pointer group"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center text-base shadow-inner">
                <Feather className="w-4 h-4 text-emerald-400" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>خصوصية 100%</span>
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100 font-serif">مُتَنَفَّس • ملاذك الآمن</h4>
              <p className="text-xs text-slate-300 font-serif leading-relaxed mt-1">
                «أثقلتك ساعات المذاكرة؟ ألقِ حِمْلكَ في مُتَنَفَّس، ودوّن خواطرك بأمان تام.»
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span className="group-hover:translate-x-1 transition-transform">فضفض الآن دون أثر 🌿</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Card 3: Monthly Milestone Reminder ("مَسَارُ الشَّهْر") */}
        <Link
          href="/#masar_shahr"
          onClick={() => onNavigate && onNavigate('masar_shahr')}
          className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 p-5 shadow-xl shadow-black/40 flex flex-col justify-between space-y-4 hover:border-amber-500/35 transition cursor-pointer group"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center text-base shadow-inner">
                <CalendarDays className="w-4 h-4 text-amber-400" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25 font-bold">
                أقرب استحقاق
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100 font-serif">مَسَارُ الشَّهْر</h4>
              <div className="mt-1.5 space-y-1">
                <div className="text-xs font-bold text-amber-200 truncate font-serif">
                  {upcomingEventTitle}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  📅 {upcomingEventDate}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-amber-300 font-bold">
            <span className="group-hover:translate-x-1 transition-transform">عرض التقويم الأكاديمي</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
        </Link>

      </div>
    </section>
  );
}
