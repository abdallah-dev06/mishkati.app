'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  BookOpen,
  HelpCircle,
  Clock,
  Key
} from 'lucide-react';
import SirajInput from './SirajInput';

export interface SirajMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  modelBadge?: string;
}

interface SirajCardProps {
  initialGreeting?: string;
  onOpenSettings?: () => void;
}

export const SirajCard: React.FC<SirajCardProps> = ({
  initialGreeting = 'السلام عليكم يا بطل 🇵🇸! اسألني عن تلخيص الدروس، تنظيم وقت الدراسة مع الأذان، أو حل وشرح أي مسألة.',
  onOpenSettings
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<SirajMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: initialGreeting,
      modelBadge: 'AI رفيقك'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    const userMsg: SirajMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text
    };

    setMessages((prev) => [...prev, userMsg]);

    // Assistant response simulation or API dispatch
    setTimeout(() => {
      const assistantMsg: SirajMessage = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: `بخصوص سؤالك: «${text}»... نوصيك بالجمع الدائم بين الأخذ بأسباب العلم والجد والاجتهاد وبين الاستعانة بالله وملازمة الأذكار. «اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلاً، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلاً».`,
        modelBadge: 'سِراج الذكي'
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 600);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-init',
        role: 'assistant',
        content: initialGreeting,
        modelBadge: 'AI رفيقك'
      }
    ]);
  };

  const handleQuickChip = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-slate-900/75 dark:bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 shadow-xl shadow-black/40 flex flex-col justify-between transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 sm:inset-10 z-50 max-w-5xl mx-auto' : 'h-full'
      }`}
    >
      {/* Ambient Radial Glows */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 p-3.5 sm:p-4 border-b border-amber-500/15 flex items-center justify-between gap-2 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500/25 via-amber-500/10 to-emerald-950/30 border border-amber-500/30 text-lg shadow-md shadow-amber-950/30 flex-shrink-0">
            <span>💡</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-bold text-sm sm:text-base text-slate-100 tracking-tight whitespace-nowrap">
                سِـرَاج
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>متصل</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              مُساعدك الأكاديمي والإيماني
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-slate-400 hover:text-amber-300 p-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-amber-500/20 transition cursor-pointer"
              title="إعدادات المفتاح"
            >
              <Key className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-amber-300 p-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-amber-500/20 transition cursor-pointer"
            title={isExpanded ? 'تصغير' : 'توسيع نافذة المحادثة'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleClearChat}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
            title="تفريغ المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className={`relative z-10 p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-grow transition-all duration-300 ${
          isExpanded ? 'max-h-[60vh]' : 'min-h-[380px] max-h-[540px]'
        }`}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'justify-end text-left' : 'justify-start text-right'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                💡
              </div>
            )}

            <div
              className={`space-y-1 max-w-full sm:max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-tl-none text-right font-medium'
                  : 'bg-slate-800/90 text-slate-100 rounded-tr-none border border-amber-500/20'
              }`}
            >
              {msg.modelBadge && (
                <div className="font-bold text-amber-300 flex items-center gap-1.5 text-[10px] pb-1 border-b border-white/10">
                  <span>{msg.modelBadge}</span>
                </div>
              )}
              <p className="select-text whitespace-pre-wrap">{msg.content}</p>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-slate-800 border border-amber-500/20 text-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                👤
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Direct Quick-Action Chips */}
      <div className="relative z-10 px-3.5 sm:px-4 py-2 border-t border-amber-500/10 bg-slate-950/40">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
          <span className="text-[10px] font-bold text-slate-400 pl-1 flex-shrink-0">سريع:</span>
          <button
            type="button"
            onClick={() => handleQuickChip('لخّص لي هذا المفهوم الدراسي بطريقة مبسطة مع نقاط رئيسية:')}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <BookOpen className="w-3 h-3" />
            <span>لخّص درس</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickChip('اشرح لي معنى ذكر أو دعاء وفضله الإيماني في السنة النبوية:')}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <HelpCircle className="w-3 h-3" />
            <span>معنى ذكر/دعاء</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickChip('رتّب لي جدول دراسي متناغم مع أوقات الصلاة اليوم في فلسطين:')}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Clock className="w-3 h-3" />
            <span>جدول دراسي</span>
          </button>
        </div>
      </div>

      {/* Input Container featuring Voice Input */}
      <div className="relative z-10 p-3 sm:p-3.5 border-t border-amber-500/15 bg-slate-950/70">
        <SirajInput onSendMessage={handleSendMessage} />
      </div>
    </section>
  );
};

export default SirajCard;
