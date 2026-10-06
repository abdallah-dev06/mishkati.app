'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Feather,
  Lock,
  Unlock,
  ShieldCheck,
  Flame,
  Trash2,
  Download,
  KeyRound,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  HeartHandshake,
  AlertTriangle,
  Smile,
  X
} from 'lucide-react';
import {
  MutanaffasEntry,
  loadEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  isPinProtected,
  setPasscode,
  verifyPasscode,
  removePasscode,
  exportArchive
} from '../../lib/mutanaffasStorage';

const MOOD_TAGS = [
  { id: 'heavy', label: 'مُثْقَل بالدراسة 🎒' },
  { id: 'optimistic', label: 'مُتَفائل ☀️' },
  { id: 'anxious', label: 'قَلِق من امتحان ⏳' },
  { id: 'grateful', label: 'شَاكِر 🌿' },
  { id: 'exhausted', label: 'مُرهَق 🌙' },
  { id: 'scattered', label: 'مُشتت الذهن 🌧️' }
];

export const MutanaffasSection: React.FC = () => {
  // State
  const [entries, setEntries] = useState<MutanaffasEntry[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [activePin, setActivePin] = useState<string>('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Editor State
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  // Incinerate / "تفريغ ما بالخاطر" Mode State
  const [isIncinerateMode, setIsIncinerateMode] = useState(false);
  const [burnText, setBurnText] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [burnSuccessMessage, setBurnSuccessMessage] = useState(false);

  // Modals & PIN Settings
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinModalError, setPinModalError] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize
  useEffect(() => {
    const pinExists = isPinProtected();
    setHasPin(pinExists);
    if (pinExists) {
      setIsLocked(true);
    } else {
      fetchEntries();
    }
  }, []);

  const fetchEntries = async (pin?: string) => {
    const list = await loadEntries(pin || activePin);
    setEntries(list);
  };

  // Auto-Save Handler for Normal Journaling
  const handleContentChange = (val: string) => {
    setEditorContent(val);
    if (!val.trim()) {
      setAutoSaveStatus('idle');
      return;
    }

    setAutoSaveStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        if (activeEntryId) {
          await updateEntry(
            activeEntryId,
            { title: editorTitle, content: val, mood: selectedMood },
            activePin
          );
        } else {
          const created = await addEntry(
            { title: editorTitle, content: val, mood: selectedMood },
            activePin
          );
          setActiveEntryId(created.id);
        }
        await fetchEntries();
        setAutoSaveStatus('saved');
      } catch (err) {
        console.error('Autosave error:', err);
      }
    }, 1200);
  };

  // Start new blank entry
  const handleNewEntry = () => {
    setActiveEntryId(null);
    setEditorTitle('');
    setEditorContent('');
    setSelectedMood(undefined);
    setAutoSaveStatus('idle');
  };

  // Select an existing entry to view/edit
  const handleSelectEntry = (entry: MutanaffasEntry) => {
    setActiveEntryId(entry.id);
    setEditorTitle(entry.title || '');
    setEditorContent(entry.content || '');
    setSelectedMood(entry.mood);
    setAutoSaveStatus('saved');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Delete an entry
  const handleDeleteEntry = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('هل أنت متأكد من رغبتك في إتلاف هذه الخاطرة نهائياً بدون أي أثر؟')) {
      deleteEntry(id);
      if (activeEntryId === id) {
        handleNewEntry();
      }
      await fetchEntries();
    }
  };

  // Unlock with PIN
  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) return;

    const valid = await verifyPasscode(pinInput.trim());
    if (valid) {
      setActivePin(pinInput.trim());
      setIsLocked(false);
      setPinError(null);
      await fetchEntries(pinInput.trim());
      setPinInput('');
    } else {
      setPinError('رمز الدخول (PIN) غير صحيح، يرجى المحاولة ثانية');
    }
  };

  // Lock View Immediately
  const handleLockNow = () => {
    setIsLocked(true);
    setActivePin('');
    handleNewEntry();
  };

  // Save PIN Setup
  const handleSaveNewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinModalError(null);

    if (newPin.length < 4) {
      setPinModalError('يجب أن يتكون الرمز من 4 أرقام على الأقل');
      return;
    }
    if (newPin !== confirmPin) {
      setPinModalError('الرمزان غير متطابقين');
      return;
    }

    await setPasscode(newPin);
    setHasPin(true);
    setActivePin(newPin);
    setShowPinModal(false);
    setNewPin('');
    setConfirmPin('');
    // Re-encrypt existing entries with new PIN
    await fetchEntries(newPin);
  };

  // Remove PIN
  const handleRemovePin = async () => {
    if (window.confirm('هل تريد إلغاء القفل برمز PIN؟ سيتم حفظ الخواطر بدون تشفير كلمة المرور.')) {
      removePasscode();
      setHasPin(false);
      setActivePin('');
      setShowPinModal(false);
      await fetchEntries();
    }
  };

  // "تفريغ ما بالخاطر" - Incinerate Stress Action
  const handleIncinerateText = () => {
    if (!burnText.trim() || isBurning) return;

    setIsBurning(true);

    // Fire / Dissolving animation timeout
    setTimeout(() => {
      setBurnText('');
      setIsBurning(false);
      setBurnSuccessMessage(true);

      setTimeout(() => {
        setBurnSuccessMessage(false);
      }, 5000);
    }, 1800);
  };

  // Export Archive Download
  const handleExport = async (format: 'txt' | 'json') => {
    const text = await exportArchive(activePin, format);
    const blob = new Blob([text], { type: format === 'json' ? 'application/json' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mutanaffas_archive_${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="mutanaffas" className="space-y-6">
      
      {/* ================= 1. ZERO-KNOWLEDGE SECURITY & PRIVACY SEAL ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 font-serif">حِمَايَةُ الخَوَاطِرِ وَالخُصُوصِيَّةِ التَّامَّة</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                100% Local / Zero Server Exposure
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              مشفر محلياً على جهازك فقط عبر Web Crypto (AES-GCM) — لا أحد يملك صلاحية القراءة سواك، ولا يمر أي حرف عبر الإنترنت.
            </p>
          </div>
        </div>

        {/* Security Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasPin && !isLocked && (
            <button
              onClick={handleLockNow}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="قفل فوري للشاشة"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>قفل الآن</span>
            </button>
          )}

          <button
            onClick={() => setShowPinModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="إعداد رمز الحماية PIN"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>{hasPin ? 'تغيير الرمز (PIN)' : 'تعيين رمز حماية (PIN)'}</span>
          </button>
        </div>
      </div>

      {/* ================= 2. PIN LOCK SCREEN (If Locked) ================= */}
      {isLocked ? (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-amber-500/30 p-8 sm:p-14 text-center shadow-2xl shadow-black/60 max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500/20 to-slate-900 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center shadow-xl">
            <Lock className="w-8 h-8 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-100 font-serif">مُتَنَفَّس مَقْفُول</h2>
            <p className="text-xs text-slate-400">
              أدخل رمز المرور الشخصي (PIN) لفك تشفير وعرض خواطرك ومساحتك الآمنة.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 max-w-xs mx-auto">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-3xl font-mono tracking-[0.5em] bg-slate-950/80 border border-amber-500/35 rounded-2xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
            />

            {pinError && (
              <p className="text-xs text-rose-400 font-medium animate-fadeIn">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-950/40 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>فتح المُتَنَفَّس</span>
            </button>
          </form>
        </div>
      ) : (
        /* ================= 3. UNLOCKED VIEW: TABS & EDITOR ================= */
        <div className="space-y-6">
          
          {/* Header Bar with Toggle: Journal Mode vs Incinerate ("تفريغ الصدر") */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-md">
                <Feather className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 font-serif flex items-center gap-2.5">
                  <span>مُتَنَفَّس</span>
                  <span className="text-[11px] px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/15 border border-amber-500/35 text-amber-200 font-serif font-medium tracking-wide shadow-xs">
                    خَاطِرٌ حُرٌّ وَسِرٌّ مَصُون
                  </span>
                </h2>
                <p className="text-xs text-amber-200/80 font-serif">
                  «حَيْثُ يُلْقِي الخَاطِرُ حِمْلَهُ — مَسَاحَتُكَ الآمِنَةُ وَالخَاصَّةُ تَمَاماً»
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-2xl border border-amber-500/20 self-start sm:self-auto">
              <button
                onClick={() => setIsIncinerateMode(false)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  !isIncinerateMode
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                <span>يومياتي المحمية</span>
              </button>
              <button
                onClick={() => setIsIncinerateMode(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isIncinerateMode
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-red-300'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>تفريغ وإحراق ما بالخاطر</span>
              </button>
            </div>
          </div>

          {/* ================= 4. INCINERATE MODE ("تفريغ ما بالخاطر") ================= */}
          {isIncinerateMode ? (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-red-500/30 p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-6">
              
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center text-sm shadow-md">
                      🔥
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 font-serif">تفريغ وإحراق ما بالخاطر (Incinerate Mode)</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    اكتب هنا كل ما يقلقك، يزعجك، أو يثقل خاطرك من ضغوط الدراسة والامتحانات... ثم اضغط على زر <strong>«إحراق»</strong> لتشهد الكلمات وهي تتلاشى وتذوب كالهباء، دون أن تُحفظ في أي مكان على وجه الأرض.
                  </p>
                </div>
              </div>

              {/* Incinerate Text Canvas */}
              <div className="relative">
                <textarea
                  rows={7}
                  value={burnText}
                  disabled={isBurning}
                  onChange={(e) => setBurnText(e.target.value)}
                  placeholder="افرغ ما بخاطرك هنا دون تردد أو خوف... لن يقرأ هذا أحد ولن يُحفظ إطلاقاً..."
                  className={`w-full bg-slate-950/80 border rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all leading-relaxed ${
                    isBurning
                      ? 'border-red-500/80 ring-4 ring-red-500/50 scale-95 opacity-0 duration-1000 blur-sm'
                      : 'border-red-500/25 focus:ring-red-500/40'
                  }`}
                />

                {/* Burning Fire Particle Overlay */}
                {isBurning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/75 backdrop-blur-sm animate-pulse text-center">
                    <Flame className="w-16 h-16 text-amber-500 animate-bounce drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]" />
                    <p className="text-sm font-bold text-amber-200 mt-2 font-serif">
                      تتلاشى المتاعب وتُلقى الأحمال...
                    </p>
                  </div>
                )}
              </div>

              {/* Burn Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>لا يتم التخزين محلياً أو سحابياً إطلاقاً.</span>
                </div>

                <button
                  type="button"
                  disabled={!burnText.trim() || isBurning}
                  onClick={handleIncinerateText}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-red-950/50 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Flame className="w-4 h-4 text-amber-200" />
                  <span>إحراق الكلمات وتفريغ ما بالخاطر 🔥</span>
                </button>
              </div>

              {/* Calming Affirmation after Burning */}
              {burnSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs text-center space-y-1.5 animate-fadeIn shadow-lg">
                  <div className="text-sm font-bold font-serif text-emerald-300">
                    «أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    ألقيتَ همك وذاب الأثر، والله أرحم بك وأعلم بحالك. خذ نفساً عميقاً وواصل مسيرتك بثقة. 🌿
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ================= 5. STANDARD PROTECTED JOURNAL ================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left / Main Column: Distraction-Free Journal Editor (lg:col-span-8) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 p-5 sm:p-7 shadow-xl shadow-black/40 space-y-4">
                  
                  {/* Editor Header: Title & Auto-Save Indicator */}
                  <div className="flex items-center justify-between gap-3 border-b border-amber-500/10 pb-3">
                    <input
                      type="text"
                      value={editorTitle}
                      onChange={(e) => {
                        setEditorTitle(e.target.value);
                        handleContentChange(editorContent);
                      }}
                      placeholder="عنوان الخاطرة (اختياري)..."
                      className="bg-transparent text-base sm:text-lg font-bold text-slate-100 placeholder-slate-500 focus:outline-none flex-grow"
                    />

                    {/* Auto-save indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                      {autoSaveStatus === 'saving' && (
                        <span className="flex items-center gap-1 text-amber-400 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>جاري الحفظ...</span>
                        </span>
                      )}
                      {autoSaveStatus === 'saved' && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>حُفظ بأمان ✓</span>
                        </span>
                      )}
                      {activeEntryId && (
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(activeEntryId)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition"
                          title="إتلاف هذه الخاطرة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mood Tags Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
                    <span className="text-[11px] text-slate-400 flex-shrink-0 font-medium">الحالة:</span>
                    {MOOD_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          const nextMood = selectedMood === tag.label ? undefined : tag.label;
                          setSelectedMood(nextMood);
                          if (editorContent.trim()) {
                            handleContentChange(editorContent);
                          }
                        }}
                        className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer border ${
                          selectedMood === tag.label
                            ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-slate-950/40 border-amber-500/15 text-slate-400 hover:text-slate-200 hover:border-amber-500/30'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>

                  {/* Main Journal Canvas */}
                  <textarea
                    rows={12}
                    value={editorContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="اكتب ما يدور بخلدك بكل أمان وحرية... الكلمات تشفر فوراً على هذا الجهاز فقط."
                    className="w-full bg-slate-950/60 border border-amber-500/20 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 leading-loose shadow-inner font-sans selection:bg-amber-500/30 selection:text-amber-200"
                  />

                  {/* Editor Footer: Word Count & New Entry Button */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-3">
                      <span>{editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0} كلمة</span>
                      <span>•</span>
                      <span>{editorContent.length} حرف</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleNewEntry}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Feather className="w-3.5 h-3.5" />
                      <span>خاطرة جديدة</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Right Column: Encrypted Archive & Past Entries (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 p-4 sm:p-5 shadow-xl shadow-black/40 space-y-4">
                  
                  {/* Archive Header */}
                  <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100 font-serif">أرشيف الخواطر</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        {entries.length}
                      </span>
                    </div>

                    {/* Export Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleExport('txt')}
                        title="تصدير كنص عادي .txt"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition text-xs flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-[10px]">تصدير</span>
                      </button>
                    </div>
                  </div>

                  {/* Entries List */}
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto no-scrollbar">
                    {entries.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-xs space-y-2">
                        <Feather className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                        <p>لا توجد خواطر مسجلة بعد.</p>
                        <p className="text-[11px] text-slate-600">اكتب أول خاطرة في المساحة المجاورة لتُحفظ هنا بأمان.</p>
                      </div>
                    ) : (
                      entries.map((entry) => (
                        <div
                          key={entry.id}
                          onClick={() => handleSelectEntry(entry)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 group ${
                            activeEntryId === entry.id
                              ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                              : 'bg-slate-950/40 border-amber-500/10 hover:border-amber-500/30 hover:bg-slate-950/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-slate-200 truncate group-hover:text-amber-300 transition">
                              {entry.title || 'خاطرة بدون عنوان'}
                            </span>
                            <button
                              onClick={(e) => handleDeleteEntry(entry.id, e)}
                              className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition"
                              title="إتلاف نهائي"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {entry.content}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                            <span>{new Date(entry.createdAt).toLocaleDateString('ar-PS')}</span>
                            {entry.mood && (
                              <span className="text-amber-400/80 font-medium truncate max-w-[120px]">
                                {entry.mood}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ================= 6. PIN SETUP / CHANGE MODAL ================= */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-sm w-full p-6 text-right space-y-4 shadow-2xl relative">
            
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-amber-500/15 pb-3">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-slate-100 font-serif">
                {hasPin ? 'إعدادات رمز الحماية (PIN)' : 'تعيين رمز حماية مشفر'}
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              رمز الدخول (4 أرقام أو أكثر) يُشتق منه مفتاح تشفير عسكري (AES-GCM) يُغلق به «مُتَنَفَّس». لا يُرسل الرمز لأي مكان، ويُحفظ بأمان في متصفحك.
            </p>

            <form onSubmit={handleSaveNewPin} className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">الرمز الجديد:</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.4em] text-xl font-mono bg-slate-950 border border-amber-500/30 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">تأكيد الرمز:</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.4em] text-xl font-mono bg-slate-950 border border-amber-500/30 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {pinModalError && (
                <p className="text-xs text-rose-400 font-medium">
                  {pinModalError}
                </p>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  حفظ الرمز وتفعيل التشفير ✨
                </button>

                {hasPin && (
                  <button
                    type="button"
                    onClick={handleRemovePin}
                    className="px-3 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
                    title="إزالة الرمز"
                  >
                    إلغاء القفل
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default MutanaffasSection;
