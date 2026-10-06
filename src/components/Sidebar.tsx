'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Sun,
  Moon,
  HandHelping,
  GraduationCap,
  PenTool,
  Disc,
  CheckSquare,
  CalendarDays,
  Feather,
  Lightbulb,
  Target,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import {
  drawerOverlayVariants,
  drawerPanelVariants,
  softSpring,
  tapScale,
  subtleTap
} from '../lib/animations';
import { usePersona } from '../context/PersonaContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute?: string;
}

export default function Sidebar({ isOpen, onClose, activeRoute = 'home' }: SidebarProps) {
  const { t, isMuthabira } = usePersona();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentHash, setCurrentHash] = useState(activeRoute);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.replace('#', '') || 'home';
      setCurrentHash(h);
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navGroups = [
    {
      groupTitle: 'الرئيسية ومواقيت الصلاة',
      items: [
        {
          id: 'home',
          title: 'الرئيسية ومواقيت الصلاة',
          subtitle: 'المواقيت الدقيقة والعد التنازلي',
          href: '#home',
          icon: <Compass className="w-4 h-4 text-amber-400" />,
          badge: 'فلسطين 🇵🇸'
        }
      ]
    },
    {
      groupTitle: 'الأذكار اليومية المأثورة',
      items: [
        {
          id: 'sabah',
          title: 'أذكار الصباح',
          subtitle: 'بركة البدايات وحصن اليوم',
          href: '#sabah',
          icon: <Sun className="w-4 h-4 text-amber-400" />,
          badge: 'صباح'
        },
        {
          id: 'masaa',
          title: 'أذكار المساء',
          subtitle: 'سكينة النفس وحفظ الليل',
          href: '#masaa',
          icon: <Moon className="w-4 h-4 text-amber-400" />,
          badge: 'مساء'
        },
        {
          id: 'after_prayer',
          title: 'أذكار بعد الصلاة',
          subtitle: 'عقب الصلوات الخمس المفروضة',
          href: '#after_prayer',
          icon: <HandHelping className="w-4 h-4 text-amber-400" />,
          badge: 'الصلوات'
        }
      ]
    },
    {
      groupTitle: 'الأدعية والذكر',
      items: [
        {
          id: 'student',
          title: 'أدعية المذاكرة والامتحانات',
          subtitle: 'تيسير الفهم وتثبيت الحفظ',
          href: '#student',
          icon: <GraduationCap className="w-4 h-4 text-amber-400" />,
          badge: 'مذاكرة'
        },
        {
          id: 'my_duas',
          title: 'أدعيتي الخاصة',
          subtitle: t('بنك أدعيتك الشخصية والامتحانات', 'بنك أدعيتكِ الشخصية والامتحانات'),
          href: '#my_duas',
          icon: <PenTool className="w-4 h-4 text-amber-400" />,
          badge: '0'
        },
        {
          id: 'tasbeeh',
          title: 'المسبحة الإلكترونية',
          subtitle: 'تسبيح وذكر حر بعداد ذكي',
          href: '#tasbeeh',
          icon: <Disc className="w-4 h-4 text-amber-400" />,
          badge: 'تسبيح'
        }
      ]
    },
    {
      groupTitle: t('مَسَاحَةُ مُـثَـابِـر', 'مَسَاحَةُ مُـثَـابِـرَة'),
      hasDot: true,
      items: [
        {
          id: 'midmar',
          title: 'مِضْمَارُ الإِنْجَاز',
          subtitle: 'ساعات الصبر والجلد',
          href: '#midmar',
          icon: <Target className="w-4 h-4 text-amber-400" />
        },
        {
          id: 'masar_yawm',
          title: 'مَسَارُ اليَوْم',
          subtitle: t('خطواتك المحسوبة لساعات يومك', 'خطواتكِ المحسوبة لساعات يومكِ'),
          href: '#masar_yawm',
          icon: <CheckSquare className="w-4 h-4 text-amber-400" />,
          badge: 'اليوم'
        },
        {
          id: 'masar',
          title: 'مَسَارُ الشَّهْر',
          subtitle: t('خارطة أيامك ومحطات إنجازك', 'خارطة أيامكِ ومحطات إنجازكِ'),
          href: '#masar',
          icon: <CalendarDays className="w-4 h-4 text-amber-400" />,
          badge: 'الشهر'
        },
        {
          id: 'mutanaffas',
          title: 'مُتَنَفَّس',
          subtitle: t('حيث يلقي الخاطر حمله — مساحتك الآمنة', 'حيث يلقي الخاطر حمله — مساحتكِ الآمنة'),
          href: '#mutanaffas',
          icon: <Feather className="w-4 h-4 text-emerald-400" />,
          badge: 'مشفر'
        }
      ]
    },
    {
      groupTitle: 'الذكاء الاصطناعي والمساعد الدراسي',
      items: [
        {
          id: 'siraj',
          title: 'سِـرَاج',
          subtitle: 'مساعدك الدراسي والروحي الذكي',
          href: '#siraj',
          icon: <Lightbulb className="w-4 h-4 text-amber-300" />,
          badge: 'مساعد'
        }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay with smooth fade */}
          <motion.div
            key="sidebar-backdrop"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerOverlayVariants}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Sidebar / Drawer Container with smooth slide-in spring physics */}
          <motion.aside
            key="sidebar-panel"
            id="navigationDrawer"
            aria-label="القائمة الجانبية للتطبيق"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={drawerPanelVariants}
            className={`fixed inset-y-0 right-0 z-50 h-screen flex flex-col bg-[#0A0F1D]/95 backdrop-blur-2xl border-l border-amber-500/20 shadow-2xl shadow-black/90 select-none will-change-transform ${
              isCollapsed ? 'w-20' : 'w-72 sm:w-80'
            }`}
          >
            {/* ================= 1. SIDEBAR HEADER ================= */}
            <div className="p-4 sm:p-5 border-b border-amber-500/15 flex items-center justify-between bg-gradient-to-b from-amber-500/10 via-transparent to-transparent flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Luminous Lantern Emblem with Breathing Amber Halo */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.35, 0.7, 0.35]
                    }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="absolute inset-0 rounded-2xl bg-amber-500/35 blur-md -z-10 pointer-events-none"
                  />
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/30 via-amber-600/20 to-emerald-950/30 border border-amber-500/40 text-amber-300 flex items-center justify-center text-lg shadow-lg shadow-amber-950/40">
                    🕯️
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="min-w-0">
                    <h2 className="text-base font-black text-slate-100 font-serif tracking-tight truncate">
                      قَائِمَةُ مِشْكَاتي
                    </h2>
                    <p className="text-[11px] text-amber-200/80 font-medium truncate">
                      {t('رفيق الطالب الفلسطيني', 'رفيقة الطالبة الفلسطينية')}
                    </p>
                  </div>
                )}
              </div>

              {/* Close button with spring rotation */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={tapScale}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                aria-label="إغلاق القائمة"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Ambient Gradient Line */}
            <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-amber-500/25 to-transparent flex-shrink-0" />

            {/* ================= 2. NAVIGATION GROUPS ================= */}
            <nav className="flex-grow p-3 sm:p-4 space-y-4 overflow-y-auto no-scrollbar">
              {navGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1.5">
                  {!isCollapsed && (
                    <div className="px-2 pt-1.5 pb-1 text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        {group.hasDot && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                        )}
                        <span>{group.groupTitle}</span>
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = currentHash === item.id;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => {
                            onClose();
                          }}
                          className={`drawer-link group relative overflow-hidden flex items-center justify-between p-2.5 sm:p-3 rounded-2xl text-xs font-bold transition-all duration-200 border ${
                            isActive
                              ? 'border-amber-500/40 text-amber-200 shadow-md shadow-amber-950/20'
                              : 'border-slate-800/80 hover:border-amber-500/30 bg-slate-900/40 hover:bg-slate-850/60 text-slate-300 hover:text-slate-100 hover:-translate-x-0.5'
                          } cursor-pointer`}
                          title={item.title}
                        >
                          {/* Sliding Active Pill Indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeNavIndicator"
                              transition={softSpring}
                              className="absolute inset-0 rounded-2xl bg-gradient-to-l from-amber-500/20 via-amber-500/10 to-transparent border-r-4 border-r-amber-400 pointer-events-none -z-10"
                            />
                          )}

                          <div className="flex items-center gap-3 min-w-0 z-10">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                                isActive
                                  ? 'bg-amber-500/25 border border-amber-500/40'
                                  : 'bg-slate-800/60 border border-slate-700/60'
                              }`}
                            >
                              {item.icon}
                            </div>

                            {!isCollapsed && (
                              <div className="min-w-0 text-right">
                                <div className="truncate text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                                  {item.title}
                                </div>
                                <div className="text-xs text-slate-300 font-normal leading-normal truncate">
                                  {item.subtitle}
                                </div>
                              </div>
                            )}
                          </div>

                          {!isCollapsed && item.badge && (
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full font-mono flex-shrink-0 z-10 ${
                                isActive
                                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/35 font-bold'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* ================= 3. STICKY FOOTER ACTIONS ================= */}
            <div className="p-3 sm:p-4 border-t border-amber-500/15 bg-slate-950/80 space-y-2.5 flex-shrink-0">
              {!isCollapsed && (
                <div className="flex items-center justify-between text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('وضع الزائر الكريم', 'وضع الزائرة الكريمة')}</span>
                  </div>
                  <span className="text-xs text-emerald-300 font-semibold">حفظ محلي</span>
                </div>
              )}

              {/* Auth Button with subtle spring bounce */}
              {!isCollapsed ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={tapScale}
                  transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                  onClick={() => {
                    alert('مرحباً بك! نظام المزامنة السحابية الموحد قيد التجهيز، وجميع بياناتك محفوظة محلياً على جهازك بأعلى درجات الخصوصية والأمان.');
                  }}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer text-center"
                >
                  تسجيل الدخول / المزامنة
                </motion.button>
              ) : (
                <motion.button
                  whileTap={tapScale}
                  onClick={() => setIsCollapsed(false)}
                  className="w-full p-2 rounded-xl bg-amber-500/20 text-amber-300 text-center flex items-center justify-center cursor-pointer"
                  title="توسيع القائمة"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
              )}

              {/* Desktop Collapse Toggle Rail */}
              <div className="hidden lg:flex items-center justify-center pt-1 border-t border-white/5">
                <motion.button
                  type="button"
                  whileTap={subtleTap}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-xs text-slate-300 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
                  title={isCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة (أيقونات فقط)'}
                >
                  {isCollapsed ? (
                    <ChevronLeft className="w-3.5 h-3.5" />
                  ) : (
                    <>
                      <span>تصغير القائمة</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
