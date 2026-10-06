'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Menu, 
  RotateCcw, 
  Copy, 
  Share2, 
  Check, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  VolumeX, 
  Flame
} from 'lucide-react';

interface AzkarItem {
  id: string;
  category: string;
  categoryLabel: string;
  text: string;
  repeat: number;
  count?: number;
  virtue?: string;
  source?: string;
}

interface AzkarReaderProps {
  initialTab?: 'sabah' | 'masaa' | 'after_prayer';
  onBackToHome?: () => void;
  onOpenDrawer?: () => void;
  onNavigateToWorkspace?: () => void;
}

export const AzkarReader: React.FC<AzkarReaderProps> = ({
  initialTab = 'sabah',
  onBackToHome,
  onOpenDrawer,
  onNavigateToWorkspace,
}) => {
  const [currentTab, setCurrentTab] = useState<'sabah' | 'masaa' | 'after_prayer'>(initialTab);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showTashkeel, setShowTashkeel] = useState<boolean>(true);
  const [fontSizeScale, setFontSizeScale] = useState<number>(1);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completedDurationText, setCompletedDurationText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sessionStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sample Authentic Azkar Dataset for reader
  const AZKAR_DATA: Record<string, AzkarItem[]> = {
    sabah: [
      {
        id: 'sabah-1',
        category: 'أذكار الصباح',
        categoryLabel: 'آية الكرسي',
        repeat: 1,
        text: 'أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.',
        virtue: 'من قالها حين يصبح أجير من الجن حتى يمسي.',
        source: 'آية الكرسي - سورة البقرة'
      },
      {
        id: 'sabah-2',
        category: 'أذكار الصباح',
        categoryLabel: 'سيد الاستغفار',
        repeat: 1,
        text: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ.',
        virtue: 'من قالها موقناً بها حين يصبح فمات دخل الجنة.',
        source: 'صحيح البخاري'
      },
      {
        id: 'sabah-3',
        category: 'أذكار الصباح',
        categoryLabel: 'الملك والحمد لله',
        repeat: 1,
        text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ للهِ وَالْحَمْدُ للهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.',
        virtue: 'سؤال الله من خير هذا اليوم والاستعاذة من شره.',
        source: 'صحيح مسلم'
      },
      {
        id: 'sabah-4',
        category: 'أذكار الصباح',
        categoryLabel: 'الحفظ ودفع البلاء',
        repeat: 3,
        text: 'بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
        virtue: 'لم يضره شيء ولا تصيبه فجأة بلاء حتى يمسي.',
        source: 'سنن أبي داود وابن ماجه'
      },
      {
        id: 'sabah-5',
        category: 'أذكار الصباح',
        categoryLabel: 'الاستعانة بالحي القيوم',
        repeat: 3,
        text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.',
        virtue: 'التوسل باسمي الله الأعظم وطلب ولايته وتيسير سائر الشؤون.',
        source: 'الحاكم والترمذي'
      }
    ],
    masaa: [
      {
        id: 'masaa-1',
        category: 'أذكار المساء',
        categoryLabel: 'آية الكرسي',
        repeat: 1,
        text: 'أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.',
        virtue: 'من قالها حين يمسي أجير من الجن حتى يصبح.',
        source: 'آية الكرسي - سورة البقرة'
      },
      {
        id: 'masaa-2',
        category: 'أذكار المساء',
        categoryLabel: 'سيد الاستغفار',
        repeat: 1,
        text: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ.',
        virtue: 'من قالها موقناً بها حين يمسي فمات دخل الجنة.',
        source: 'صحيح البخاري'
      },
      {
        id: 'masaa-3',
        category: 'أذكار المساء',
        categoryLabel: 'أمسينا وأمسى الملك لله',
        repeat: 1,
        text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ للهِ وَالْحَمْدُ للهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا.',
        virtue: 'سؤال الله من خير هذه الليلة والتحصن من شرورها.',
        source: 'صحيح مسلم'
      },
      {
        id: 'masaa-4',
        category: 'أذكار المساء',
        categoryLabel: 'الحفظ ودفع البلاء',
        repeat: 3,
        text: 'بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
        virtue: 'لم يضره شيء ولا تصيبه فجأة بلاء حتى يصبح.',
        source: 'سنن أبي داود وابن ماجه'
      },
      {
        id: 'masaa-5',
        category: 'أذكار المساء',
        categoryLabel: 'كلمات الله التامات',
        repeat: 3,
        text: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
        virtue: 'من قالها حين يمسي لم يضره شيء في تلك الليلة.',
        source: 'صحيح مسلم'
      }
    ],
    after_prayer: [
      {
        id: 'after-1',
        category: 'أذكار بعد الصلاة',
        categoryLabel: 'الاستغفار والسلام',
        repeat: 1,
        text: 'أَسْتَغْفِرُ اللهَ، أَسْتَغْفِرُ اللهَ، أَسْتَغْفِرُ اللهَ.\nاللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ.',
        virtue: 'دبر كل صلاة مفروضة.',
        source: 'صحيح مسلم'
      },
      {
        id: 'after-2',
        category: 'أذكار بعد الصلاة',
        categoryLabel: 'التسبيح والتحميد والتكبير',
        repeat: 33,
        text: 'سُبْحَانَ اللهِ (33)، وَالْحَمْدُ للهِ (33)، وَاللهُ أَكْبَرُ (33).',
        virtue: 'دبر كل صلاة مكتوبة يغفر الله بها الخطايا.',
        source: 'صحيح مسلم'
      },
      {
        id: 'after-3',
        category: 'أذكار بعد الصلاة',
        categoryLabel: 'تمام المائة',
        repeat: 1,
        text: 'لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
        virtue: 'تمام المائة بعد التسبيح والتحميد والتكبير.',
        source: 'صحيح مسلم'
      }
    ]
  };

  // Format today as YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize state and session stopwatch
  useEffect(() => {
    const todayStr = getTodayStr();
    const savedCounts = localStorage.getItem('mishkati_counts');
    if (savedCounts) {
      try {
        setCounts(JSON.parse(savedCounts));
      } catch (e) {}
    }

    // Start authentic reading stopwatch
    sessionStartTimeRef.current = Date.now();
    setSessionSeconds(0);
    setSessionActive(true);

    timerIntervalRef.current = setInterval(() => {
      if (sessionStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        setSessionSeconds(elapsed);
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleDecrement = (id: string, defaultRepeat: number) => {
    const current = counts[id] !== undefined ? counts[id] : defaultRepeat;
    if (current <= 0) return;

    const nextVal = current - 1;
    const newCounts = { ...counts, [id]: nextVal };
    setCounts(newCounts);
    localStorage.setItem('mishkati_counts', JSON.stringify(newCounts));

    // Check if whole set completed
    const currentItems = AZKAR_DATA[currentTab] || [];
    const isSetFinished = currentItems.every((item) => {
      const c = item.id === id ? nextVal : (newCounts[item.id] !== undefined ? newCounts[item.id] : item.repeat);
      return c === 0;
    });

    if (isSetFinished && (currentTab === 'sabah' || currentTab === 'masaa')) {
      handleCompleteAzkarSet();
    }
  };

  const handleCompleteAzkarSet = () => {
    // 1. Calculate duration
    const elapsed = sessionSeconds;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    let durText = '';
    if (mins === 0) {
      durText = `قضيتَ ${secs} ثانية في معية الذكر والسكينة`;
    } else if (secs === 0) {
      durText = `قضيتَ ${mins} دقيقة في معية الذكر والسكينة`;
    } else {
      durText = `قضيتَ ${mins} دقيقة و ${secs} ثانية في معية الذكر والسكينة`;
    }
    setCompletedDurationText(durText);

    // 2. Automatic check-off in localStorage for Masar Al-Yawm
    const todayStr = getTodayStr();
    const habitId = currentTab === 'sabah' ? 'habit_azkar_sabah' : 'habit_azkar_masaa';
    const habitTitle = currentTab === 'sabah' ? 'أذكار الصباح' : 'أذكار المساء';

    // Update habits
    const habitsKey = `mishkati_daily_habits_${todayStr}`;
    let habitsData: Record<string, boolean> = {};
    try {
      const raw = localStorage.getItem(habitsKey);
      if (raw) habitsData = JSON.parse(raw);
    } catch (e) {}
    habitsData[habitId] = true;
    localStorage.setItem(habitsKey, JSON.stringify(habitsData));

    // Update matching tasks
    const tasksKey = `mishkati_daily_tasks_${todayStr}`;
    let tasksData: any[] = [];
    try {
      const rawT = localStorage.getItem(tasksKey);
      if (rawT) tasksData = JSON.parse(rawT);
    } catch (e) {}
    let updatedTask = false;
    tasksData.forEach((t) => {
      if (t.title && t.title.includes(habitTitle)) {
        t.completed = true;
        t.durationSpent = durText;
        t.completedAt = new Date().toISOString();
        updatedTask = true;
      }
    });
    if (updatedTask) {
      localStorage.setItem(tasksKey, JSON.stringify(tasksData));
    }

    // 3. Dispatch reactive sync event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mishkati_task_synced', {
          detail: {
            habitId,
            habitTitle,
            type: currentTab,
            duration: durText,
            completedAt: new Date().toISOString(),
          },
        })
      );
    }

    // 4. Open achievement modal
    setShowCompletionModal(true);
    showToast(`تم ختم ${habitTitle} وشطبها تلقائياً من مسار اليوم ✓`);
  };

  const handleResetSection = () => {
    const newCounts = { ...counts };
    (AZKAR_DATA[currentTab] || []).forEach((item) => {
      newCounts[item.id] = item.repeat;
    });
    setCounts(newCounts);
    localStorage.setItem('mishkati_counts', JSON.stringify(newCounts));
    showToast('تمت إعادة ضبط عدادات هذا القسم بنجاح');
  };

  const copyText = (t: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(t).then(() => showToast('تم النسخ إلى الحافظة بنجاح 📋'));
    }
  };

  const currentItems = AZKAR_DATA[currentTab] || [];
  const completedCount = currentItems.filter((i) => {
    const c = counts[i.id] !== undefined ? counts[i.id] : i.repeat;
    return c === 0;
  }).length;
  const pct = currentItems.length > 0 ? Math.round((completedCount / currentItems.length) * 100) : 0;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-5 animate-fadeIn text-right select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
          <div className="bg-slate-900/95 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 border border-amber-500/40 text-xs font-bold shadow-black/80">
            <span>🕯️</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Reading Navigation Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-amber-500/20 shadow-md">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-bold transition shadow-sm cursor-pointer hover:border-amber-500/30 border border-transparent"
        >
          <ArrowRight className="w-4 h-4 text-amber-400 rotate-180" />
          <span>رجوع إلى الرئيسية</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Active Reading Stopwatch Capsule */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(sessionSeconds)}</span>
          </div>

          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              aria-label="فتح القائمة لتغيير القسم"
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 border border-amber-500/20 transition cursor-pointer"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span>القائمة</span>
            </button>
          )}
        </div>
      </div>

      {/* Reading Progress Toolbar */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-amber-500/20 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-grow space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm text-slate-100 font-serif">
                  {currentTab === 'sabah' ? 'أذكار الصباح' : currentTab === 'masaa' ? 'أذكار المساء' : 'أذكار بعد الصلاة'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300 font-semibold font-mono">
                  أنجزت {completedCount} من {currentItems.length} ذكراً
                </span>
              </div>
              <span className="font-bold text-amber-400 font-mono">{pct}%</span>
            </div>

            <div className="w-full h-2 bg-slate-950/80 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-l from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-500/10">
            {/* Tashkeel toggle */}
            <button
              onClick={() => setShowTashkeel(!showTashkeel)}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-amber-500/20 transition"
            >
              <span className="font-serif">التشكيل: {showTashkeel ? 'مُفعّل' : 'مُعطّل'}</span>
            </button>

            {/* Font Size Scaling */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-amber-500/20 text-xs">
              <button onClick={() => setFontSizeScale(Math.max(0.85, fontSizeScale - 0.1))} className="px-2 py-1 hover:text-amber-400">A-</button>
              <button onClick={() => setFontSizeScale(1)} className="px-2 py-1 font-bold hover:text-amber-400">A</button>
              <button onClick={() => setFontSizeScale(Math.min(1.4, fontSizeScale + 0.1))} className="px-2 py-1 hover:text-amber-400">A+</button>
            </div>

            {/* Reset */}
            <button
              onClick={handleResetSection}
              title="إعادة ضبط عدادات هذا القسم"
              className="p-1.5 px-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
          </div>
        </div>
      </div>

      {/* Azkar Cards List */}
      <div className="space-y-4">
        {currentItems.map((item, idx) => {
          const count = counts[item.id] !== undefined ? counts[item.id] : item.repeat;
          const isDone = count === 0;

          return (
            <div
              key={item.id}
              className={`rounded-3xl p-5 sm:p-6 transition-all duration-300 border shadow-sm ${
                isDone
                  ? 'bg-amber-950/15 border-amber-500/30 shadow-amber-500/5'
                  : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    # ذكر {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {item.categoryLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-sans">
                    {item.repeat > 1 ? `يُكرر ${item.repeat} مرات` : 'مرة واحدة'}
                  </span>
                  {isDone && (
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      تم الإنجاز ✓
                    </span>
                  )}
                </div>
              </div>

              <div
                className="font-serif text-slate-100 leading-loose py-2 select-text"
                style={{
                  fontSize: `${1.25 * fontSizeScale}rem`,
                  lineHeight: `${2.1 * fontSizeScale}rem`,
                }}
              >
                {item.text.split('\n').map((line, lIdx) => (
                  <React.Fragment key={lIdx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>

              {item.virtue && (
                <div className="mt-3.5 p-3 rounded-2xl bg-slate-950/60 border border-amber-500/15 flex items-start gap-2.5 text-xs">
                  <span className="text-amber-400 mt-0.5">🌟</span>
                  <div className="space-y-0.5 text-slate-300 leading-relaxed font-sans">
                    <span className="font-bold text-amber-300 font-serif">فضل الذكر:</span> {item.virtue}
                    {item.source && <div className="text-[10px] text-slate-500 pt-0.5">المصدر: {item.source}</div>}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyText(item.text)}
                    className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 border border-slate-700 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </button>
                </div>

                <button
                  onClick={() => handleDecrement(item.id, item.repeat)}
                  disabled={isDone}
                  className={`min-w-[120px] px-5 py-2.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    isDone
                      ? 'bg-emerald-600/80 text-white cursor-default'
                      : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white shadow-amber-950/50 active:scale-95 cursor-pointer'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>تم</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-semibold opacity-90">المتبقي:</span>
                      <span className="text-lg font-mono">{count}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Celebratory Achievement Modal */}
      {showCompletionModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCompletionModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
        >
          <div className="relative bg-slate-900/95 border border-amber-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-black/80">
            
            {/* Luminous Emblem */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-18 h-18 rounded-3xl bg-gradient-to-br from-amber-500/25 via-amber-600/20 to-emerald-950/40 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-950/50">
                🕯️
              </div>
            </div>

            {/* Congratulatory Calligraphy & Blessings */}
            <div className="space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300 font-serif tracking-tight">
                «تَقَبَّلَ اللهُ طَاعَتَك»
              </h3>
              <p className="text-xs sm:text-sm font-serif text-amber-100/90 font-medium">
                «حِرْزٌ لَكَ وَبَرَكَةٌ فِي سَاعَاتِ يَوْمِك»
              </p>
              <p className="text-xs text-slate-400">
                أتممت ختم {currentTab === 'sabah' ? 'أذكار الصباح' : 'أذكار المساء'} كاملة بحمد الله وتوفيقه.
              </p>
            </div>

            {/* Duration Spent Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm shadow-inner font-sans">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{completedDurationText}</span>
            </div>

            {/* Automatic Task Check-off Badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم شطب المهمة تلقائياً في «مَسَارُ اليَوْم» وتوثيق الإنجاز</span>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowCompletionModal(false);
                  if (onNavigateToWorkspace) onNavigateToWorkspace();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>الانتقال إلى «مَسَارُ اليَوْم» لمتابعة الإنجاز</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>

              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-semibold transition cursor-pointer"
              >
                <span>البقاء في الأذكار</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AzkarReader;
