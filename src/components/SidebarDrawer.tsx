'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Target,
  Sun,
  Moon,
  HeartHandshake,
  GraduationCap,
  PenTool,
  Sparkles,
  Bot,
  X,
  ChevronLeft,
  Compass,
  Flame,
  Clock,
  CheckCircle2,
  Feather,
  CalendarDays
} from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  isSpecial?: boolean;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  // Navigation Groups
  const azkarItems: NavItem[] = [
    {
      id: 'sabah',
      title: 'أذكار الصباح',
      subtitle: 'بركة البدايات وحصن اليوم',
      href: '/azkar/sabah',
      badge: '0/19',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <Sun className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'masaa',
      title: 'أذكار المساء',
      subtitle: 'سكينة النفس وحفظ الليل',
      href: '/azkar/masaa',
      badge: '0/15',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <Moon className="w-4 h-4 text-amber-300" />
    },
    {
      id: 'after_prayer',
      title: 'أذكار بعد الصلاة',
      subtitle: 'عقب الصلوات الخمس المفروضة',
      href: '/azkar/after-prayer',
      badge: '0/8',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <HeartHandshake className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'student',
      title: 'أدعية المذاكرة والامتحانات',
      subtitle: 'تيسير الفهم وتثبيت الحفظ',
      href: '/azkar/student',
      badge: 'مذاكرة',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <GraduationCap className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'my_duas',
      title: 'أدعيتي الخاصة',
      subtitle: 'بنك أدعيتك الشخصية والامتحانات',
      href: '/azkar/my-duas',
      badge: '0',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <PenTool className="w-4 h-4 text-amber-300" />
    },
    {
      id: 'tasbeeh',
      title: 'المسبحة الإلكترونية',
      subtitle: 'تسبيح وذكر حر بعداد ذكي',
      href: '/azkar/tasbeeh',
      badge: 'تسبيح',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />
    }
  ];

  // Muthabir Workspace Section
  const productivityItems: NavItem[] = [
    {
      id: 'masar',
      title: 'مَسَارُ الشَّهْر',
      subtitle: 'خَارِطَةُ أَيَّامِكَ وَمَحَطَّاتُ إِنجَازِك',
      href: '/workspace#masar',
      icon: <CalendarDays className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
    },
    {
      id: 'mutanaffas',
      title: 'مُتَنَفَّس',
      subtitle: 'حَيْثُ يُلْقِي الخَاطِرُ حِمْلَهُ — مَسَاحَتُكَ الآمِنَةُ',
      href: '/workspace#mutanaffas',
      icon: <Feather className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
    }
  ];

  // AI Assistant Section
  const aiItems: NavItem[] = [
    {
      id: 'siraj',
      title: 'سِـرَاج',
      subtitle: 'مُساعدك الأكاديمي والإيماني الذكي',
      href: '/siraj',
      icon: <Bot className="w-4 h-4 text-amber-400" />
    }
  ];

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        id="sidebarDrawer"
        aria-label="قائمة التنقل الجانبية لمِشكاتي"
        className={`fixed top-0 right-0 z-50 h-full w-[88vw] max-w-[340px] sm:w-80 bg-slate-900/95 dark:bg-[#080d19]/95 backdrop-blur-2xl border-l border-amber-500/20 shadow-2xl shadow-black/80 flex flex-col transform transition-transform duration-300 ease-out text-slate-100 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="relative p-4 sm:p-5 border-b border-amber-500/15 flex items-center justify-between bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-lg shadow-md shadow-amber-950/40 border border-amber-400/30">
              🕯️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-lg text-slate-100 tracking-wide">
                  مِـشْـكَـاتِـي
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                  فلسطين 🇵🇸
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">نور يومك وعون دراستك</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Links */}
        <nav className="flex-grow p-3 sm:p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {/* 1. Main Home Link */}
          <Link
            href="/"
            onClick={onClose}
            className={`flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all duration-200 border ${
              pathname === '/'
                ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white shadow-lg shadow-amber-950/40 border-amber-400/40'
                : 'bg-slate-800/50 hover:bg-slate-800/80 text-slate-200 border-amber-500/10 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🕌</span>
              <div>
                <div className="font-bold">الرئيسية ومواقيت الصلاة</div>
                <div className="text-[10px] text-slate-300/80 font-normal">المواقيت الدقيقة والعد التنازلي</div>
              </div>
            </div>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">
              الأذان
            </span>
          </Link>

          {/* 2. Azkar Section Header */}
          <div className="pt-2 pb-0.5 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
            <span>الأذكار اليومية المأثورة</span>
          </div>

          {/* Azkar Links */}
          <div className="space-y-1.5">
            {azkarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl text-xs font-bold transition-all duration-200 border ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 ring-1 ring-amber-400/30 shadow-md'
                      : 'bg-slate-800/40 hover:bg-slate-800/70 text-slate-300 hover:text-slate-100 border-slate-700/40 hover:border-amber-500/25'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-xl bg-slate-900/60 border border-amber-500/15 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="font-bold truncate">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">{item.subtitle}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex-shrink-0 ${
                        item.badgeColor || 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* 3. DEDICATED SECTION: Muthabir Workspace (مساحة مُثابِر) */}
          <div className="pt-3 pb-0.5 px-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              <span>مَسَاحَةُ مُـثَـابِـر</span>
            </span>
          </div>

          {/* "مساحة مُثابِر" (Muthabir Workspace Navigation Item) */}
          {productivityItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`group relative overflow-hidden flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all duration-300 border ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-transparent text-amber-200 border-amber-400/50 ring-1 ring-amber-400/40 border-r-4 border-r-amber-400 shadow-lg shadow-amber-950/40'
                    : 'bg-slate-800/60 hover:bg-slate-800/90 text-slate-200 border-amber-500/25 hover:border-amber-500/50 hover:scale-[1.01] shadow-md shadow-black/30'
                }`}
              >
                {/* Active Glowing Indicator Bar & Background Radial Shimmer */}
                {isActive && (
                  <div className="absolute inset-y-0 right-0 w-1 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,1)]" />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  {/* Icon with Amber Glow Accent */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0 border ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/50 scale-105'
                        : 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/30 text-amber-400 group-hover:scale-105 group-hover:border-amber-400/60'
                    }`}
                  >
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Subtitle / Badge */}
                {item.badge && (
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30 group-hover:bg-amber-500/25'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* 4. AI Assistant Section */}
          <div className="pt-2 pb-0.5 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
            <span>الذكاء الاصطناعي والمساعد الدراسي</span>
          </div>

          <div className="space-y-1.5">
            {aiItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all duration-200 border ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-emerald-950/30 text-amber-200 border-amber-400/50 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-slate-800/50 hover:bg-slate-800/80 text-slate-200 border-amber-500/20 hover:border-amber-400/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                      💡
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30 bg-amber-500/20 text-amber-300 flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Drawer Footer Quote & Student Status */}
        <div className="p-3.5 sm:p-4 border-t border-amber-500/15 bg-slate-950/70 backdrop-blur-md">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
            <p className="text-[11px] font-serif text-amber-200 font-medium">
              «ثَبَاتٌ عَلَى الدَّرْبِ حَتَّى بُلُوغِ الغَايَة»
            </p>
            <p className="text-[9px] text-slate-400">مِشكاتي • رفيق طالب العلم في فلسطين 🇵🇸</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarDrawer;
