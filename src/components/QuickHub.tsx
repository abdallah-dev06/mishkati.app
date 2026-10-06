'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealContainer } from './ui/ScrollReveal';
import {
  CalendarDays,
  Target,
  Wind,
  CheckCircle2,
  TrendingUp,
  HeartHandshake,
  ArrowUpRight,
  Flame,
  Award
} from 'lucide-react';

interface QuickHubCardProps {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  accentColor: string;
  progress: number;
  progressLabel: string;
  actionText: string;
  items: string[];
}

const HUB_SECTIONS: QuickHubCardProps[] = [
  {
    title: 'مَسَارُ اليَوْم',
    subtitle: 'الأجندة الدراسية والورد اليومي المتكامل',
    badge: 'المهام والصلوات',
    icon: <Target className="w-5 h-5 text-amber-400" />,
    accentColor: 'from-amber-500/20 to-amber-600/5',
    progress: 68,
    progressLabel: 'إنجاز مهام اليوم: 4 من 6',
    actionText: 'فتح قائمة المهام اليومية',
    items: [
      '✅ صلاة الظهر في وقتها + سنن الرواتب',
      '✅ تلخيص 15 صفحة تفاضل وتكامل',
      '⏳ إتمام ورد حفظ سورة النور (وجهان)',
      '⏳ حل بنك أسئلة الكيمياء العضوية'
    ]
  },
  {
    title: 'مَسَارُ الشَّهْر',
    subtitle: 'الخطة الأكاديمية وجداول الامتحانات والتقويم',
    badge: 'الأهداف الكبرى',
    icon: <CalendarDays className="w-5 h-5 text-emerald-400" />,
    accentColor: 'from-emerald-500/20 to-emerald-600/5',
    progress: 82,
    progressLabel: 'خطة ربيع 2026: 82% من الأهداف',
    actionText: 'استعراض التقويم والامتحانات',
    items: [
      '🎯 امتحان نصف الفصل لمادة الفيزياء (متبقٍ 5 أيام)',
      '📚 إنهاء مراجعة الجزء الأول من اللغة العربية',
      '🔥 المحافظة على عقد الهمة (14 يوماً متواصلاً)',
      '📈 تسليم مشروع البرمجة وقواعد البيانات'
    ]
  },
  {
    title: 'مُتَنَفَّس',
    subtitle: 'خلوة الطمأنينة وراحة الفؤاد بين ساعات الجد',
    badge: 'سكينة وانشراح',
    icon: <Wind className="w-5 h-5 text-sky-400" />,
    accentColor: 'from-sky-500/20 to-sky-600/5',
    progress: 100,
    progressLabel: 'تمارين التنفس والورد القلبي جاهزة',
    actionText: 'بدء جلسة سكينة وتنفس',
    items: [
      '🍃 تمرين التنفس العميق 4-7-8 لتهدئة التوتر',
      '🤍 أذكار كشف الكرب وتيسير الأمور الصعبة',
      '🎧 أصوات الطبيعة الخافتة: مطر غزة ونسيم القدس',
      '📖 خاطرة إيمانية لترميم العزم وشحذ الهمم'
    ]
  }
];

export const QuickHub: React.FC = () => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Section Header with Fade-Up */}
      <ScrollReveal variant="fadeUp" className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-xs font-bold text-amber-300 mb-3 shadow-md">
          <span>🏛️</span>
          <span>مَسَاحَةُ مُثَابِر</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-100 font-serif mb-2">
          ثلاثية البناء: اليوم، الشهر، والسكينة
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
          تنظيم متناغم يجمع بين انضباط الإنجاز الأكاديمي، الرؤية الشهرية للمساقات، واستراحة النفس بين المحطات.
        </p>
      </ScrollReveal>

      {/* 3-Column Staggered Viewport Container */}
      <ScrollRevealContainer
        staggerChildren={0.1}
        delayChildren={0.05}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
      >
        {HUB_SECTIONS.map((card, idx) => (
          <ScrollReveal
            key={idx}
            variant="glowBorder"
            delay={idx * 0.1}
            className="flex flex-col h-full"
          >
            <div className={`h-full rounded-3xl bg-slate-900/70 border border-amber-500/20 backdrop-blur-xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300`}>
              {/* Subtle Gradient Backlight */}
              <div
                className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-br ${card.accentColor} rounded-full blur-3xl pointer-events-none -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500`}
              />

              <div>
                {/* Card Top Pill & Icon */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-950/70 border border-amber-500/25 flex items-center justify-center shadow-inner">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-100 font-serif">
                        {card.title}
                      </h3>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-200">
                        {card.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-5 font-sans">
                  {card.subtitle}
                </p>

                {/* Progress Bar Component */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 mb-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{card.progressLabel}</span>
                    <span className="text-amber-300 font-mono font-bold">{card.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Preview */}
                <div className="space-y-2 mb-6">
                  {card.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="text-xs text-slate-200 py-1.5 px-3 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between"
                    >
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-amber-500/15 text-slate-200 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
              >
                <span>{card.actionText}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </ScrollReveal>
        ))}
      </ScrollRevealContainer>
    </section>
  );
};

export default QuickHub;
