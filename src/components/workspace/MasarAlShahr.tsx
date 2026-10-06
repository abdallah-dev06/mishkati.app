'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Edit3,
  Download,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  Target,
  AlertCircle,
  X,
  FileText,
  Calendar
} from 'lucide-react';

export type EventCategory = 'exam' | 'deadline' | 'revision' | 'personal' | string;

export interface MasarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  category: EventCategory;
  notes?: string;
  completed?: boolean;
}

export const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    borderClass: string;
    icon: string;
  }
> = {
  exam: {
    label: 'امتحان / اختبار',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
    borderClass: 'border-rose-500/40',
    icon: '📝'
  },
  deadline: {
    label: 'تسليم واجب / مشروع',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    borderClass: 'border-amber-500/40',
    icon: '⏳'
  },
  revision: {
    label: 'جلسة مراجعة مكثفة',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
    borderClass: 'border-emerald-500/40',
    icon: '📚'
  },
  personal: {
    label: 'هدف شخصي',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    dotClass: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]',
    borderClass: 'border-sky-500/40',
    icon: '🎯'
  }
};

export function getCategoryStyle(catStr?: string) {
  if (!catStr) {
    return {
      label: 'عام',
      icon: '📌',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      dotClass: 'bg-slate-400',
      borderClass: 'border-slate-700',
      key: 'other'
    };
  }
  const s = String(catStr).toLowerCase();
  if (s.includes('امتحان') || s.includes('اختبار') || s.includes('كويز') || s === 'exam') {
    return {
      label: catStr === 'exam' ? 'امتحان / اختبار' : catStr,
      icon: '📝',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
      borderClass: 'border-rose-500/40',
      key: 'exam'
    };
  }
  if (s.includes('واجب') || s.includes('مشروع') || s.includes('تسليم') || s.includes('تقرير') || s.includes('بحث') || s === 'deadline') {
    return {
      label: catStr === 'deadline' ? 'تسليم واجب / مشروع' : catStr,
      icon: '⏳',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
      borderClass: 'border-amber-500/40',
      key: 'deadline'
    };
  }
  if (s.includes('مراجعة') || s.includes('دراسة') || s.includes('تلخيص') || s.includes('قراءة') || s.includes('حفظ') || s === 'revision') {
    return {
      label: catStr === 'revision' ? 'جلسة مراجعة مكثفة' : catStr,
      icon: '📚',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
      borderClass: 'border-emerald-500/40',
      key: 'revision'
    };
  }
  if (s.includes('هدف') || s.includes('شخصي') || s.includes('تطوير') || s.includes('عادة') || s === 'personal') {
    return {
      label: catStr === 'personal' ? 'هدف شخصي' : catStr,
      icon: '🎯',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      dotClass: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]',
      borderClass: 'border-sky-500/40',
      key: 'personal'
    };
  }
  return {
    label: catStr,
    icon: '🏷️',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    dotClass: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.7)]',
    borderClass: 'border-purple-500/40',
    key: 'custom'
  };
}

const ARABIC_DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

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

const STORAGE_KEY = 'mishkati_masar_events';

export default function MasarAlShahr() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<MasarEvent[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<EventCategory | 'all'>('all');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('exam');
  const [formNotes, setFormNotes] = useState('');

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setEvents(JSON.parse(saved));
      } else {
        // Sample default events for Palestinian student trajectory
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const defaultEvents: MasarEvent[] = [
          {
            id: 'sample-1',
            title: 'امتحان الفيزياء الوزاري التجريبي',
            date: `${y}-${m}-12`,
            time: '09:00',
            category: 'exam',
            notes: 'يشمل الفصول الثلاثة الأولى، التركيز على قوانين كيرشوف',
            completed: false
          },
          {
            id: 'sample-2',
            title: 'تسليم تقرير الكيمياء العملي',
            date: `${y}-${m}-15`,
            time: '12:00',
            category: 'deadline',
            notes: 'المعايرة الحجمية وتدوين الاستنتاجات بدقة',
            completed: true
          },
          {
            id: 'sample-3',
            title: 'مراجعة شاملة لقواعد اللغة العربية',
            date: `${y}-${m}-20`,
            time: '16:30',
            category: 'revision',
            notes: 'إعراب الممنوع من الصرف وأسماء الأفعال',
            completed: false
          }
        ];
        setEvents(defaultEvents);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEvents));
      }
    } catch (e) {
      console.error('Failed to load masar events:', e);
    }
  }, []);

  // Save to localStorage
  const saveEvents = (updated: MasarEvent[]) => {
    setEvents(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save masar events:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Date Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Today representation (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const ty = d.getFullYear();
    const tm = String(d.getMonth() + 1).padStart(2, '0');
    const td = String(d.getDate()).padStart(2, '0');
    return `${ty}-${tm}-${td}`;
  }, []);

  // Compute Calendar Grid Cells
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Map JS Sunday(0)..Saturday(6) to Saturday(0)..Friday(6)
    // Saturday = 0, Sunday = 1, Monday = 2, Tuesday = 3, Wednesday = 4, Thursday = 5, Friday = 6
    const startDayIndex = (firstDayOfMonth.getDay() + 1) % 7;

    const cells: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const pMonth = month === 0 ? 12 : month;
      const pYear = month === 0 ? year - 1 : year;
      const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
      cells.push({
        dayNumber: pDay,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Trailing next month filler days to complete 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nMonth = month === 11 ? 1 : month + 2;
      const nYear = month === 11 ? year + 1 : year;
      const dateStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(nDay(n)).padStart(2, '0')}`;
      cells.push({
        dayNumber: n,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    function nDay(val: number) {
      return val;
    }

    return cells;
  }, [year, month, todayStr]);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date());
    setSelectedDateStr(todayStr);
  };

  // Group events by date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, MasarEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  // Filtered Events for the current month view stats
  const currentMonthEvents = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return events.filter((ev) => ev.date.startsWith(prefix));
  }, [events, year, month]);

  const stats = useMemo(() => {
    const total = currentMonthEvents.length;
    const exams = currentMonthEvents.filter((e) => getCategoryStyle(e.category).key === 'exam').length;
    const deadlines = currentMonthEvents.filter((e) => getCategoryStyle(e.category).key === 'deadline').length;
    const completed = currentMonthEvents.filter((e) => e.completed).length;
    return { total, exams, deadlines, completed };
  }, [currentMonthEvents]);

  // Modal Open Handlers
  const handleOpenAddModal = (dateStr?: string) => {
    setEditingEventId(null);
    setFormTitle('');
    setFormDate(dateStr || selectedDateStr || todayStr);
    setFormTime('');
    setFormCategory('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ev: MasarEvent) => {
    setEditingEventId(ev.id);
    setFormTitle(ev.title);
    setFormDate(ev.date);
    setFormTime(ev.time || '');
    setFormCategory(ev.category);
    setFormNotes(ev.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('يرجى كتابة عنوان المحطة أو المهمة');
      return;
    }
    if (!formDate) {
      showToast('يرجى تحديد تاريخ المحطة الدراسية');
      return;
    }

    const finalCategory = formCategory.trim() || 'عام';

    if (editingEventId) {
      const updated = events.map((ev) =>
        ev.id === editingEventId
          ? {
              ...ev,
              title: formTitle.trim(),
              date: formDate,
              time: formTime.trim() || undefined,
              category: finalCategory,
              notes: formNotes.trim() || undefined
            }
          : ev
      );
      saveEvents(updated);
      showToast('تم تعديل المحطة بنجاح ✓');
    } else {
      const newEv: MasarEvent = {
        id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: formTitle.trim(),
        date: formDate,
        time: formTime.trim() || undefined,
        category: finalCategory,
        notes: formNotes.trim() || undefined,
        completed: false
      };
      saveEvents([...events, newEv]);
      showToast('أُضيفت المحطة إلى مسار الشهر 🎯');
    }

    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('هل ترغب في حذف هذه المحطة من مسار الشهر؟')) {
      const updated = events.filter((ev) => ev.id !== id);
      saveEvents(updated);
      showToast('تم حذف المحطة');
    }
  };

  const handleToggleComplete = (id: string) => {
    const updated = events.map((ev) =>
      ev.id === id ? { ...ev, completed: !ev.completed } : ev
    );
    saveEvents(updated);
  };

  const handlePurgeMonthEvents = () => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const count = events.filter((e) => e.date.startsWith(prefix)).length;
    if (count === 0) {
      alert('لا توجد أحداث مجدولة في هذا الشهر لمسحها.');
      return;
    }
    if (confirm(`هل أنت متأكد من مسح جميع أحداث ومحطات شهر ${ARABIC_MONTHS[month]} (${count} محطة)؟`)) {
      const updated = events.filter((e) => !e.date.startsWith(prefix));
      saveEvents(updated);
      showToast('تم مسح أحداث الشهر بنجاح');
    }
  };

  // Export Month to iCalendar (.ics) format
  const handleExportICS = () => {
    if (currentMonthEvents.length === 0) {
      alert('لا توجد أحداث مجدولة في هذا الشهر لتصديرها.');
      return;
    }

    const formatDateForICS = (dateStr: string, timeStr?: string) => {
      const cleanDate = dateStr.replace(/-/g, '');
      if (timeStr) {
        const cleanTime = timeStr.replace(/:/g, '') + '00';
        return `${cleanDate}T${cleanTime}`;
      }
      return cleanDate;
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mishkati//Masar Al-Shahr Calendar//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:مسار الشهر - مِشكاتي',
      'X-WR-TIMEZONE:Asia/Jerusalem'
    ];

    currentMonthEvents.forEach((ev) => {
      const dtstart = formatDateForICS(ev.date, ev.time);
      const isAllDay = !ev.time;
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:mishkati-${ev.id}@mishkati.ps`);
      icsContent.push(`DTSTAMP:${formatDateForICS(todayStr, '12:00')}Z`);
      if (isAllDay) {
        icsContent.push(`DTSTART;VALUE=DATE:${dtstart}`);
      } else {
        icsContent.push(`DTSTART:${dtstart}`);
      }
      icsContent.push(`SUMMARY:${ev.title}`);
      icsContent.push(`DESCRIPTION:${getCategoryStyle(ev.category).label}${ev.notes ? ' - ' + ev.notes : ''}`);
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `masar-schedule-${year}-${String(month + 1).padStart(2, '0')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تصدير ملف التقويم (.ics) بنجاح 📥');
  };

  // Selected Day Details
  const selectedDayEvents = useMemo(() => {
    if (!selectedDateStr) return [];
    return eventsByDate[selectedDateStr] || [];
  }, [selectedDateStr, eventsByDate]);

  return (
    <div id="masarSection" className="space-y-6">
      
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
            {/* Glowing Calendar Emblem */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500/25 via-amber-600/15 to-emerald-950/30 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/30 flex-shrink-0">
              <CalendarDays className="w-7 h-7 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-serif tracking-tight">
                  مَسَارُ الشَّهْر
                </h2>
                <span className="text-[11px] px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/15 border border-amber-500/35 text-amber-200 font-serif font-medium tracking-wide shadow-xs">
                  التقويم الأكاديمي الشامل
                </span>
              </div>
              <p className="text-sm font-serif text-amber-200/90 font-medium">
                «خَارِطَةُ أَيَّامِكَ وَمَحَطَّاتُ إِنجَازِك»
              </p>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                خطّط لامتحاناتك، مواعيد تسليم الواجبات، وجلسات المراجعة المركزّة مع حفظ محلي كامل على جهازك.
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              onClick={() => handleOpenAddModal(selectedDateStr || todayStr)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/50 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة محطة</span>
            </button>

            <button
              onClick={handleExportICS}
              title="تصدير الأحداث إلى Google / Apple Calendar"
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">تصدير التقويم</span>
            </button>
          </div>

        </div>

        {/* Stats Strip */}
        <div className="mt-5 pt-4 border-t border-amber-500/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">إجمالي محطات الشهر:</span>
            <span className="font-bold text-amber-300 font-mono text-sm">{stats.total}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">الامتحانات والاختبارات:</span>
            <span className="font-bold text-rose-300 font-mono text-sm">{stats.exams}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">مواعيد التسليم:</span>
            <span className="font-bold text-amber-300 font-mono text-sm">{stats.deadlines}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">المحطات المنجزة:</span>
            <span className="font-bold text-emerald-300 font-mono text-sm">
              {stats.completed} / {stats.total}
            </span>
          </div>
        </div>

      </section>

      {/* ================= 2. MAIN CALENDAR GRID & CONTROLS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left/Main Column: Calendar Grid (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-amber-500/20 p-4 sm:p-6 shadow-xl shadow-black/40 space-y-4">
            
            {/* Calendar Controls & Month Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-2xl border border-amber-500/20">
                  <button
                    onClick={handlePrevMonth}
                    title="الشهر السابق"
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    title="الشهر التالي"
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 font-serif flex items-center gap-2">
                    <span>{ARABIC_MONTHS[month]}</span>
                    <span className="font-mono text-amber-300">{year}</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleJumpToToday}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                >
                  اليوم
                </button>

                <button
                  onClick={handlePurgeMonthEvents}
                  title="مسح جميع أحداث الشهر الحالي"
                  className="px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-500/30 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">مسح الشهر</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-slate-400 pl-1 text-[11px] font-medium flex-shrink-0">تصفية:</span>
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3 py-1 rounded-xl font-bold transition flex-shrink-0 cursor-pointer ${
                  activeCategoryFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                الكل ({currentMonthEvents.length})
              </button>
              {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((cat) => {
                const conf = CATEGORY_CONFIG[cat];
                const count = currentMonthEvents.filter((e) => e.category === cat).length;
                const isSelected = activeCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-xl transition flex-shrink-0 cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? conf.badgeClass + ' font-bold shadow-xs'
                        : 'bg-slate-800/40 text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <span>{conf.icon}</span>
                    <span>{conf.label.split('/')[0].trim()}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Calendar Table Grid */}
            <div className="w-full">
              {/* Day Headers (Saturday to Friday) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center">
                {ARABIC_DAYS.map((dayName, idx) => (
                  <div
                    key={dayName}
                    className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl ${
                      idx === 6
                        ? 'text-amber-300/90 bg-amber-500/10' // Friday accent
                        : 'text-slate-400 bg-slate-950/40'
                    }`}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Day Cells (7-column grid) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarCells.map((cell, idx) => {
                  const dayEvents = (eventsByDate[cell.dateStr] || []).filter((e) =>
                    activeCategoryFilter === 'all'
                      ? true
                      : getCategoryStyle(e.category).key === activeCategoryFilter || e.category === activeCategoryFilter
                  );
                  const isSelected = selectedDateStr === cell.dateStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`min-h-[75px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between transition-all cursor-pointer border relative select-none ${
                        cell.isCurrentMonth
                          ? isSelected
                            ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                            : cell.isToday
                            ? 'bg-amber-500/10 border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 hover:border-amber-500/40'
                          : 'bg-slate-950/20 border-slate-900/60 text-slate-600 opacity-40 hover:opacity-75'
                      }`}
                    >
                      {/* Top Bar inside cell: Date number & Today tag */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`font-mono text-xs sm:text-sm font-bold ${
                            cell.isToday
                              ? 'text-amber-300 font-black'
                              : cell.isCurrentMonth
                              ? 'text-slate-200'
                              : 'text-slate-600'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {cell.isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.9)]" />
                        )}
                      </div>

                      {/* Event Mini Indicators / Badges */}
                      <div className="space-y-1 mt-1">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const conf = getCategoryStyle(ev.category);
                          return (
                            <div
                              key={ev.id}
                              className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium flex items-center gap-1 border ${
                                conf.badgeClass
                              } ${ev.completed ? 'line-through opacity-60' : ''}`}
                              title={`${ev.title} (${conf.label})`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${conf.dotClass}`} />
                              <span className="truncate">{ev.title}</span>
                            </div>
                          );
                        })}

                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-amber-300/80 font-mono text-center font-bold">
                            +{dayEvents.length - 2} المزيد
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Selected Day Detail Drawer & Agenda (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl bg-slate-900/75 backdrop-blur-xl border border-amber-500/25 p-5 shadow-xl shadow-black/40 space-y-4">
            
            {/* Header: Selected Date & Add Action */}
            <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
              <div className="space-y-0.5">
                <div className="text-xs text-amber-300 font-serif font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>محطات اليوم المحدد:</span>
                </div>
                <div className="text-sm font-bold text-slate-100 font-mono">
                  {selectedDateStr || todayStr}
                  {selectedDateStr === todayStr && (
                    <span className="mr-2 text-[10px] text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full font-sans font-bold">
                      اليوم الحاضر
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleOpenAddModal(selectedDateStr || todayStr)}
                className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="إضافة حدث لهذا اليوم"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>

            {/* Agenda List for Selected Day */}
            {selectedDayEvents.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-500 flex items-center justify-center mx-auto text-lg">
                  🕊️
                </div>
                <p className="text-xs text-slate-400 font-serif">
                  لا توجد محطات مجدولة في هذا التاريخ.
                </p>
                <button
                  onClick={() => handleOpenAddModal(selectedDateStr || todayStr)}
                  className="text-xs text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                >
                  + جدولة امتحان أو واجب الآن
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto no-scrollbar">
                {selectedDayEvents.map((ev) => {
                  const conf = getCategoryStyle(ev.category);
                  return (
                    <div
                      key={ev.id}
                      className={`p-3.5 rounded-2xl bg-slate-950/70 border transition-all space-y-2 ${
                        conf.borderClass
                      } ${ev.completed ? 'opacity-70 bg-slate-950/40' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <button
                            onClick={() => handleToggleComplete(ev.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition cursor-pointer flex-shrink-0"
                            title={ev.completed ? 'إعادة كغير منجز' : 'تحديد كمنجز'}
                          >
                            {ev.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <h4
                              className={`text-xs font-bold text-slate-100 leading-snug break-words ${
                                ev.completed ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {ev.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span className={`px-2 py-0.5 rounded-full border ${conf.badgeClass}`}>
                                {conf.label}
                              </span>
                              {ev.time && (
                                <span className="flex items-center gap-1 font-mono text-slate-300">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>{ev.time}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Edit / Delete */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleOpenEditModal(ev)}
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer"
                            title="تعديل المحطة"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                            title="حذف المحطة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Notes / Details */}
                      {ev.notes && (
                        <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Islamic Wisdom Quote for Planning */}
            <div className="pt-3 border-t border-amber-500/15 text-center">
              <p className="text-[11px] font-serif text-amber-200/80">
                «احْرِصْ عَلَى مَا يَنْفَعُكَ، وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ»
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* ================= 3. ADD / EDIT EVENT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-md w-full p-6 text-right space-y-4 shadow-2xl relative">
            
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-amber-500/15 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">
                {editingEventId ? '✏️' : '🎯'}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100 font-serif">
                  {editingEventId ? 'تعديل محطة في مسار الشهر' : 'إضافة محطة جديدة إلى المسار'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  سجّل مواعيدك الدراسية الهامة لتنظيم وقتك واستعدادك
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 pt-1 text-xs">
              
              {/* Event Title */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">عنوان المحطة / المهمة:</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: امتحان فيزياء نهائي، تسليم بحث التاريخ..."
                  className="w-full bg-slate-950 border border-amber-500/25 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">التاريخ:</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/25 rounded-xl p-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">الوقت (اختياري):</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/25 rounded-xl p-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Custom Category Input & Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-bold block">التصنيف الأكاديمي:</label>
                  <span className="text-[10px] text-amber-400 font-mono">اكتب التصنيف كتابياً أو اختر من المقترحات</span>
                </div>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="اكتب تصنيف المحطة (مثال: امتحان، واجب، مراجعة، مشروع، كويز...)"
                  className="w-full bg-slate-950 border border-amber-500/25 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans text-xs"
                />

                {/* Quick Choice Suggestion Chips */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold block">مقترحات سريعة بنقرة واحدة:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setFormCategory('امتحان / اختبار')}
                      className="px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <span>📝</span>
                      <span>امتحان / اختبار</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormCategory('تسليم واجب / مشروع')}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <span>⏳</span>
                      <span>تسليم واجب / مشروع</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormCategory('جلسة مراجعة مكثفة')}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <span>📚</span>
                      <span>جلسة مراجعة مكثفة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormCategory('هدف شخصي')}
                      className="px-2.5 py-1 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <span>🎯</span>
                      <span>هدف شخصي</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">ملاحظات أو روابط هامة:</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="الفصول المطلوبة، أسئلة السنوات السابقة، التوصيات..."
                  className="w-full bg-slate-950 border border-amber-500/25 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
                >
                  {editingEventId ? 'حفظ التعديلات ✓' : 'إضافة المحطة للمسار'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
