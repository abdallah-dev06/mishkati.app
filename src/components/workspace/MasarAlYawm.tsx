'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  ListTodo,
  CalendarCheck,
  BellRing,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Target
} from 'lucide-react';
import {
  customEase,
  tapScale,
  subtleTap,
  burstRingVariants,
  softSpring
} from '../../lib/animations';

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface DailyTask {
  id: string;
  title: string;
  priority: PriorityLevel;
  completed: boolean;
  timeEstimate?: string;
  createdAt: number;
}

export interface CoreHabit {
  id: string;
  title: string;
  subtitle: string;
  category: 'prayer' | 'azkar';
  link?: string;
  badge?: string;
}

// 7 Immutable Core Habits (المهام الثابتة غير القابلة للحذف)
export const CORE_HABITS: CoreHabit[] = [
  {
    id: 'habit_fajr',
    title: 'صلاة الفجر',
    subtitle: 'في وقتها مع ركعتي الفجر',
    category: 'prayer',
    badge: 'توقيت القدس'
  },
  {
    id: 'habit_dhuhr',
    title: 'صلاة الظهر',
    subtitle: 'أربع ركعات بخشوع وسكينة',
    category: 'prayer',
    badge: 'توقيت القدس'
  },
  {
    id: 'habit_asr',
    title: 'صلاة العصر',
    subtitle: 'الصلاة الوسطى والمحافظة عليها',
    category: 'prayer',
    badge: 'توقيت القدس'
  },
  {
    id: 'habit_maghrib',
    title: 'صلاة المغرب',
    subtitle: 'ثلاث ركعات مع راتبتها',
    category: 'prayer',
    badge: 'توقيت القدس'
  },
  {
    id: 'habit_isha',
    title: 'صلاة العشاء',
    subtitle: 'مع راتبة العشاء وركعة الوتر',
    category: 'prayer',
    badge: 'توقيت القدس'
  },
  {
    id: 'habit_azkar_sabah',
    title: 'أذكار الصباح',
    subtitle: 'حصنك اليومي وبركة بداياتك',
    category: 'azkar',
    link: '#sabah',
    badge: 'حصن المسلم'
  },
  {
    id: 'habit_azkar_masaa',
    title: 'أذكار المساء',
    subtitle: 'طمأنينة الروح وراحة القلب بعد يوم دراسي',
    category: 'azkar',
    link: '#masaa',
    badge: 'حصن المسلم'
  }
];

export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    borderClass: string;
    icon: string;
  }
> = {
  high: {
    label: 'أولوية قصوى / عاجل ومهم',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
    borderClass: 'border-rose-500/40',
    icon: '🔴'
  },
  medium: {
    label: 'مهم / إنجاز دراسي',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    borderClass: 'border-amber-500/40',
    icon: '🟡'
  },
  low: {
    label: 'روتيني / منخفض',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    dotClass: 'bg-slate-400',
    borderClass: 'border-slate-700',
    icon: '🟢'
  }
};

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_MONTHS = [
  'يناير (كانون الثاني)',
  'فبراير (شباط)',
  'مارس (آذار)',
  'أبريل (نيسان)',
  'مايو (أيار)',
  'يونيو (حزيران)',
  'يوليو (تموز)',
  'أغسطس (آب)',
  'سبتمبر (أيلول)',
  'أكتوبر (تشرين الأول)',
  'نوفمبر (تشرين الثاني)',
  'ديسمبر (كانون الأول)'
];

function getTodayDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function MasarAlYawm() {
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateString());
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [habitsCompleted, setHabitsCompleted] = useState<Record<string, boolean>>({});
  const [monthlyEvents, setMonthlyEvents] = useState<{ id: string; title: string; category?: string; notes?: string; time?: string }[]>([]);
  
  // New Task Input Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('medium');
  const [newTaskTime, setNewTaskTime] = useState('');

  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingPriority, setEditingPriority] = useState<PriorityLevel>('medium');

  // Filter
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'pending' | 'done'>('all');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const todayStr = useMemo(() => getTodayDateString(), []);
  const isToday = selectedDateStr === todayStr;

  // Storage Keys
  const tasksStorageKey = `mishkati_daily_tasks_${selectedDateStr}`;
  const habitsStorageKey = `mishkati_daily_habits_${selectedDateStr}`;

  // Load daily tasks & habits on date change
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem(tasksStorageKey);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // If it's today and empty, provide initial helpful sample study tasks
        if (isToday) {
          const sampleTasks: DailyTask[] = [
            {
              id: 'task_sample_1',
              title: 'حل أسئلة نهاية الوحدة الثانية في الرياضيات',
              priority: 'high',
              completed: false,
              timeEstimate: '60 دقيقة',
              createdAt: Date.now() - 3600000
            },
            {
              id: 'task_sample_2',
              title: 'مراجعة تلخيص درس البلاغة والأدب',
              priority: 'medium',
              completed: false,
              timeEstimate: '45 دقيقة',
              createdAt: Date.now() - 1800000
            }
          ];
          setTasks(sampleTasks);
          localStorage.setItem(tasksStorageKey, JSON.stringify(sampleTasks));
        } else {
          setTasks([]);
        }
      }

      const savedHabits = localStorage.getItem(habitsStorageKey);
      if (savedHabits) {
        setHabitsCompleted(JSON.parse(savedHabits));
      } else {
        setHabitsCompleted({});
      }
    } catch (e) {
      console.error('Error loading daily tasks/habits:', e);
    }
  }, [selectedDateStr, tasksStorageKey, habitsStorageKey, isToday]);

  // Load Monthly Events from Masar Al-Shahr for Ribbon Reminder
  useEffect(() => {
    try {
      const masarEventsRaw = localStorage.getItem('mishkati_masar_events');
      if (masarEventsRaw) {
        const parsed = JSON.parse(masarEventsRaw);
        if (Array.isArray(parsed)) {
          const matches = parsed.filter((e: { date?: string }) => e.date === selectedDateStr);
          setMonthlyEvents(matches);
        }
      } else {
        setMonthlyEvents([]);
      }
    } catch (e) {
      console.error('Error loading monthly events for ribbon:', e);
    }
  }, [selectedDateStr]);

  // Persist Tasks
  const saveTasks = (newTasks: DailyTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(tasksStorageKey, JSON.stringify(newTasks));
    } catch (e) {
      console.error('Error saving daily tasks:', e);
    }
  };

  // Persist Habits
  const saveHabits = (newHabits: Record<string, boolean>) => {
    setHabitsCompleted(newHabits);
    try {
      localStorage.setItem(habitsStorageKey, JSON.stringify(newHabits));
    } catch (e) {
      console.error('Error saving daily habits:', e);
    }
  };

  // Add Task
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: DailyTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      completed: false,
      timeEstimate: newTaskTime.trim() || undefined,
      createdAt: Date.now()
    };

    saveTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskTime('');
    showToast('أُضيفت المهمة إلى مسار اليوم بنجاح ✓');
  };

  // Toggle Task Completion
  const toggleTaskCompleted = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  // Delete Task
  const deleteTask = (id: string) => {
    if (confirm('هل ترغب في حذف هذه المهمة من مسار اليوم؟')) {
      const updated = tasks.filter((t) => t.id !== id);
      saveTasks(updated);
      showToast('تم حذف المهمة');
    }
  };

  // Edit Task
  const startEditTask = (task: DailyTask) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingPriority(task.priority);
  };

  const saveEditTask = (id: string) => {
    if (!editingTitle.trim()) return;
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, title: editingTitle.trim(), priority: editingPriority } : t
    );
    saveTasks(updated);
    setEditingTaskId(null);
    showToast('تم تعديل المهمة بنجاح');
  };

  // Toggle Core Habit Completion
  const toggleHabit = (id: string) => {
    const updated = {
      ...habitsCompleted,
      [id]: !habitsCompleted[id]
    };
    saveHabits(updated);
  };

  // Import monthly event directly into daily tasks
  const handleImportMonthlyEvent = (ev: { id: string; title: string; notes?: string; time?: string }) => {
    const alreadyExists = tasks.some((t) => t.title.includes(ev.title));
    if (alreadyExists) {
      showToast('المهمة مضافة بالفعل في قائمة مهام اليوم ℹ️');
      return;
    }

    const importedTask: DailyTask = {
      id: `imported_ev_${Date.now()}`,
      title: `[محطة شهرية] ${ev.title}${ev.notes ? ` (${ev.notes})` : ''}`,
      priority: 'high',
      completed: false,
      timeEstimate: ev.time || undefined,
      createdAt: Date.now()
    };

    saveTasks([importedTask, ...tasks]);
    showToast('أُضيفت المحطة الشهرية إلى مهام يومك بنجاح 🎯');
  };

  // Date Navigation
  const changeDateByDays = (days: number) => {
    const parts = selectedDateStr.split('-');
    const current = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    current.setDate(current.getDate() + days);
    setSelectedDateStr(getTodayDateString(current));
  };

  const jumpToToday = () => {
    setSelectedDateStr(todayStr);
  };

  // Formatted date details for header
  const formattedDateString = useMemo(() => {
    const parts = selectedDateStr.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayName = ARABIC_DAYS[d.getDay()];
    const dayNum = d.getDate();
    const monthName = ARABIC_MONTHS[d.getMonth()].split(' ')[0];
    const yearNum = d.getFullYear();
    return `${dayName}، ${dayNum} ${monthName} ${yearNum}`;
  }, [selectedDateStr]);

  // Stats
  const habitStats = useMemo(() => {
    const total = CORE_HABITS.length;
    const completed = CORE_HABITS.filter((h) => habitsCompleted[h.id]).length;
    const pct = Math.round((completed / total) * 100);
    return { total, completed, pct };
  }, [habitsCompleted]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const high = tasks.filter((t) => t.priority === 'high').length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, high, pct };
  }, [tasks]);

  const overallStats = useMemo(() => {
    const totalItems = habitStats.total + taskStats.total;
    const completedItems = habitStats.completed + taskStats.completed;
    const pct = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    return { totalItems, completedItems, pct };
  }, [habitStats, taskStats]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (activeFilter === 'high') return t.priority === 'high';
      if (activeFilter === 'medium') return t.priority === 'medium';
      if (activeFilter === 'low') return t.priority === 'low';
      if (activeFilter === 'pending') return !t.completed;
      if (activeFilter === 'done') return t.completed;
      return true;
    });
  }, [tasks, activeFilter]);

  return (
    <div id="masarYawmSection" className="space-y-6">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="bg-slate-900/95 border border-amber-500/40 text-amber-200 px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2">
            <span>📌</span>
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* ================= 1. HEADER & IDENTITY CARD ================= */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900/75 backdrop-blur-xl border border-amber-500/25 p-5 sm:p-7 shadow-xl shadow-black/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          <div className="flex items-start gap-4">
            {/* Glowing Icon Emblem */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500/25 via-amber-600/15 to-emerald-950/30 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/30 flex-shrink-0">
              <CheckSquare className="w-7 h-7 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-serif tracking-tight">
                  مَسَارُ اليَوْم
                </h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/15 border border-amber-500/35 text-amber-200 font-serif tracking-wide shadow-xs">
                  إدارة المهام والتركيز اليومي
                </span>
                {isToday && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    اليوم الحالي
                  </span>
                )}
              </div>
              <p className="text-sm font-serif text-amber-200/90 font-medium">
                «خُطُوَاتُكَ المَحْسُوبَةُ لِسَاعَاتِ يَوْمِك»
              </p>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                رتّب أولوياتك، ثبّت محطاتك الإيمانية، وأنجز مهامك الدراسية خطوة بخطوة مع حفظ تلقائي محلي كامل.
              </p>
            </div>
          </div>

          {/* Date Selector Navigation Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-950/60 p-1.5 rounded-2xl border border-amber-500/20">
            <button
              onClick={() => changeDateByDays(1)}
              title="اليوم التالي"
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="px-3 text-center">
              <div className="text-xs font-bold text-slate-100 font-serif whitespace-nowrap">
                {formattedDateString}
              </div>
              <div className="text-[10px] text-amber-300 font-mono">
                {selectedDateStr}
              </div>
            </div>

            <button
              onClick={() => changeDateByDays(-1)}
              title="اليوم السابق"
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {!isToday && (
              <button
                onClick={jumpToToday}
                className="mr-1 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition cursor-pointer"
              >
                اليوم
              </button>
            )}
          </div>

        </div>

        {/* Global Progress Strip */}
        <div className="mt-5 pt-4 border-t border-amber-500/15 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-bold">مستوى إنجاز اليوم الشامل:</span>
              <span className="font-mono text-amber-300 font-bold text-sm">
                {overallStats.completedItems} / {overallStats.totalItems} محطة ({overallStats.pct}%)
              </span>
            </div>
            <div className="text-xs text-slate-300 font-serif hidden sm:block">
              {overallStats.pct === 100
                ? 'مبارك إتمام جميع محطات ومهام اليوم بالكامل! 🌿'
                : overallStats.pct >= 50
                ? 'قطعت أكثر من نصف مسار اليوم، واصل ثباتك!'
                : 'يومك يبدأ بخطوة محسوبة، استعن بالله'}
            </div>
          </div>

          <div className="h-2 w-full bg-slate-950/70 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${overallStats.pct}%` }}
            />
          </div>
        </div>

      </section>

      {/* ================= 2. SMART MONTHLY SYNC REMINDER RIBBON ================= */}
      {monthlyEvents.length > 0 && (
        <div className="space-y-2">
          {monthlyEvents.map((ev) => (
            <div
              key={ev.id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-slate-900/60 border border-amber-500/30 border-r-4 border-r-amber-400 p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <BellRing className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-serif">
                      مجدول في مسار الشهر
                    </span>
                    {ev.time && (
                      <span className="text-xs font-medium text-slate-200 font-mono">
                        ⏰ {ev.time}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 font-serif mt-0.5">
                    «مُجَدْوَلٌ فِي مَسَارِ الشَّهْرِ لِهَذَا اليَوْم: {ev.title} — فَالزَمْ عَزْمَك!»
                  </h4>
                  {ev.notes && (
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {ev.notes}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleImportMonthlyEvent(ev)}
                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95 flex-shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>إضافة إلى مهام اليوم</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= 3. TWO-COLUMN LAYOUT: PINNED HABITS & DYNAMIC TASKS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT COLUMN (xl:col-span-5): PINNED IMMUTABLE CORE HABITS */}
        <div className="xl:col-span-5 space-y-4">
          <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 p-5 sm:p-6 shadow-xl shadow-black/40 space-y-4">
            
            <div className="flex items-center justify-between border-b border-amber-500/15 pb-3.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🕌</span>
                  <h3 className="font-bold text-base text-slate-100 font-serif">
                    المهام الثابتة غير القابلة للحذف
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  محطات إيمانية ثابتة تصنع بركة يومك — لا تقبل الحذف
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-bold">
                  أساسيات اليوم
                </span>
                <div className="text-[11px] text-emerald-400 font-mono font-bold mt-1">
                  {habitStats.completed} / {habitStats.total}
                </div>
              </div>
            </div>

            {/* List of 7 Core Habits */}
            <div className="space-y-2">
              {CORE_HABITS.map((habit) => {
                const isChecked = !!habitsCompleted[habit.id];
                return (
                  <motion.div
                    key={habit.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.2, ease: customEase }}
                    onClick={() => toggleHabit(habit.id)}
                    className={`relative p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer select-none overflow-hidden ${
                      isChecked
                        ? 'bg-slate-950/40 border-emerald-500/30 text-slate-400'
                        : 'bg-slate-950/60 border-amber-500/20 hover:border-amber-500/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        {isChecked && (
                          <motion.span
                            variants={burstRingVariants}
                            initial="initial"
                            animate="burst"
                            className="absolute -inset-1 rounded-lg border-2 border-emerald-400 pointer-events-none"
                          />
                        )}
                        <button
                          type="button"
                          aria-label="تحديد المهمة كمكتملة"
                          className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'border-2 border-slate-600 hover:border-amber-400'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4
                            className={`text-xs font-bold truncate transition-all duration-300 ${
                              isChecked ? 'line-through text-slate-500 opacity-80' : 'text-slate-100'
                            }`}
                          >
                            {habit.title}
                          </h4>
                          {habit.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-300/80 border border-amber-500/20 font-sans hidden sm:inline">
                              {habit.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {habit.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Optional Quick Link for Azkar */}
                    {habit.link && (
                      <Link
                        href={habit.link}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] px-2 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold transition flex items-center gap-1 flex-shrink-0"
                      >
                        <span>قراءة</span>
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Spiritual Footnote */}
            <div className="pt-2 text-center text-[10px] text-slate-500 font-serif border-t border-white/5">
              تُصفّر هذه الأساسيات تلقائياً مع إشراقة كل فجر جديد لتجديد العزم
            </div>

          </div>
        </div>

        {/* LEFT COLUMN (xl:col-span-7): DYNAMIC DAILY TASKS & PRIORITY MATRIX */}
        <div className="xl:col-span-7 space-y-4">
          <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/25 p-5 sm:p-6 shadow-xl shadow-black/40 space-y-5">
            
            {/* Header & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/15 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-100 font-serif flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-amber-400" />
                  <span>قائمة المهام الدراسية ومصفوفة الأولويات</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  أنجزت {taskStats.completed} من أصل {taskStats.total} مهمة اليوم
                </p>
              </div>

              {/* Priority Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs ${
                    activeFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800/60 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  الكل ({tasks.length})
                </button>
                <button
                  onClick={() => setActiveFilter('high')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 ${
                    activeFilter === 'high'
                      ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40 font-semibold'
                      : 'bg-slate-800/40 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  <span>🔴</span>
                  <span>قصوى ({tasks.filter((t) => t.priority === 'high').length})</span>
                </button>
                <button
                  onClick={() => setActiveFilter('medium')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 ${
                    activeFilter === 'medium'
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40 font-semibold'
                      : 'bg-slate-800/40 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  <span>🟡</span>
                  <span>مهم ({tasks.filter((t) => t.priority === 'medium').length})</span>
                </button>
                <button
                  onClick={() => setActiveFilter('low')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 ${
                    activeFilter === 'low'
                      ? 'bg-slate-700 text-slate-100 border border-slate-600 font-semibold'
                      : 'bg-slate-800/40 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  <span>🟢</span>
                  <span>روتيني ({tasks.filter((t) => t.priority === 'low').length})</span>
                </button>
              </div>
            </div>

            {/* Quick Task Creation Input Bar */}
            <form onSubmit={handleAddTask} className="space-y-2.5 bg-slate-950/60 p-3.5 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="أضف مهمة دراسية جديدة... (اضغط Enter للإضافة السريعة)"
                  className="w-full bg-slate-900 border border-amber-500/25 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1 flex-shrink-0 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span className="hidden sm:inline">إضافة</span>
                </button>
              </div>

              {/* Priority & Estimation Options Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium">مستوى الأولوية:</span>
                  {(['high', 'medium', 'low'] as PriorityLevel[]).map((lvl) => {
                    const conf = PRIORITY_CONFIG[lvl];
                    const isSelected = newTaskPriority === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewTaskPriority(lvl)}
                        className={`px-2 py-0.5 rounded-lg border text-[11px] transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? conf.badgeClass + ' font-bold shadow-xs'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{conf.icon}</span>
                        <span>{lvl === 'high' ? 'قصوى / عاجل' : lvl === 'medium' ? 'مهم ودراسي' : 'روتيني'}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">تقدير الوقت:</span>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    placeholder="مثال: 45د، ساعتان"
                    className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 text-center"
                  />
                </div>
              </div>
            </form>

            {/* Tasks List */}
            <div className="space-y-2.5 min-h-[160px]">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs space-y-2 border border-dashed border-amber-500/15 rounded-2xl p-4">
                  <span className="text-3xl block opacity-40">📝</span>
                  <p className="font-bold text-slate-400">لا توجد مهام دراسية في هذا التصنيف.</p>
                  <p className="text-[11px] text-slate-500">
                    اكتب مهمتك في الحقل أعلاه واضغط Enter لتنظيم ساعات يومك خطوة بخطوة.
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const pConf = PRIORITY_CONFIG[task.priority];
                  const isEditing = editingTaskId === task.id;

                  if (isEditing) {
                    return (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 shadow-lg"
                      >
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                          <div className="flex items-center gap-1.5">
                            {(['high', 'medium', 'low'] as PriorityLevel[]).map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setEditingPriority(lvl)}
                                className={`px-2 py-0.5 rounded-lg border text-[11px] ${
                                  editingPriority === lvl
                                    ? PRIORITY_CONFIG[lvl].badgeClass + ' font-bold'
                                    : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}
                              >
                                {PRIORITY_CONFIG[lvl].icon} {lvl}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => saveEditTask(task.id)}
                              className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                            >
                              حفظ ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTaskId(null)}
                              className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.25, ease: customEase }}
                      className={`relative p-3.5 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-3 overflow-hidden ${
                        task.completed
                          ? 'bg-slate-950/40 border-emerald-500/20 text-slate-400 opacity-75'
                          : 'bg-slate-950/60 border-amber-500/20 hover:border-amber-500/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-grow">
                        <div className="relative mt-0.5 flex-shrink-0">
                          {task.completed && (
                            <motion.span
                              variants={burstRingVariants}
                              initial="initial"
                              animate="burst"
                              className="absolute -inset-1 rounded-lg border-2 border-emerald-400 pointer-events-none"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => toggleTaskCompleted(task.id)}
                            aria-label="تحديد المهمة كمكتملة"
                            className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                              task.completed
                                ? 'bg-emerald-500 text-slate-950 font-bold'
                                : 'border-2 border-slate-600 hover:border-amber-400'
                            }`}
                          >
                            {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="min-w-0 space-y-1">
                          <h4
                            className={`text-xs sm:text-sm font-bold break-words transition-all duration-300 ${
                              task.completed ? 'line-through text-slate-500 opacity-80' : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </h4>

                          <div className="flex items-center gap-2 text-[10px] flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium ${pConf.badgeClass}`}
                            >
                              <span>{pConf.icon}</span>
                              <span>{pConf.label.split('/')[0].trim()}</span>
                            </span>

                            {task.timeEstimate && (
                              <span className="text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400/80" />
                                <span>{task.timeEstimate}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Task Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={tapScale}
                          onClick={() => startEditTask(task)}
                          className="p-1 text-slate-500 hover:text-amber-300 transition cursor-pointer"
                          title="تعديل المهمة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={tapScale}
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="حذف المهمة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Islamic Wisdom Quote for Daily Focus */}
            <div className="pt-3 border-t border-amber-500/15 text-center">
              <p className="text-[11px] font-serif text-amber-200/80">
                «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ»
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
