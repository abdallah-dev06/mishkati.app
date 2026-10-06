'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2,
  Minimize2,
  Trash2,
  Key
} from 'lucide-react';
import { customEase, tapScale } from '../lib/animations';
import { usePersona } from '../context/PersonaContext';
import { SirajInput } from './siraj/SirajInput';
import { SirajMessageList, ChatMessage } from './siraj/SirajMessageList';
import { SirajAttachment } from '../lib/attachmentUtils';

interface SirajHeroCardProps {
  onOpenSettings?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function SirajHeroCard({
  onOpenSettings,
  isExpanded = false,
  onToggleExpand
}: SirajHeroCardProps) {
  const { t, isMuthabira } = usePersona();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'siraj',
      text: t(
        'السلام عليكم يا بطل 🇵🇸! أنا رفيقك سِراج في مشكاتي. يسعدني مساعدتك في تنظيم جدول المذاكرة المتناغم مع أوقات الصلاة في مدينتك، تلخيص الدروس والمستندات (PDF/PPTX)، وتحليل لقطات الكاميرا والمسائل خطوة بخطوة.',
        'السلام عليكم يا بطلة 🇵🇸! أنا رفيقكِ سِراج في مشكاتي. يسعدني مساعدتكِ في تنظيم جدول المذاكرة المتناغم مع أوقات الصلاة في مدينتكِ، تلخيص الدروس والمستندات (PDF/PPTX)، وتحليل لقطات الكاميرا والمسائل خطوة بخطوة.'
      ),
      time: 'الآن'
    }
  ]);

  const quickPrompts = [
    { label: 'لخّص لي هذا المفهوم', icon: '📚', text: 'لخّص لي هذا المفهوم الدراسي بطريقة مبسطة مع نقاط رئيسية:' },
    { label: 'جدول مراجعة للامتحان', icon: '📅', text: 'ضع لي جدول مراجعة مكثف وموزع على فترات للتحضير للامتحان القادم:' },
    { label: 'دعاء لتثبيت الحفظ', icon: '🤲', text: 'دعاء مبارك وإرشادات نبوية للسكينة وتثبيت الحفظ قبل المذاكرة:' },
    { label: 'أرح بالي بآية', icon: '🌿', text: 'أرح بالي بآية كريمة وتأمل يبعث السكينة والطمأنينة في قلبي:' }
  ];

  const handleSendMessage = (text: string, attachments?: SirajAttachment[]) => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      attachments: attachments?.map((a) => ({
        id: a.id,
        type: a.type,
        previewUrl: a.previewUrl,
        name: a.name,
        mimeType: a.mimeType,
        size: a.size,
        url: a.url,
        domain: a.domain
      })),
      time: new Date().toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);

    // Simulated intelligent multimodal response
    setTimeout(() => {
      let replyText = `أهلاً بك! لقد تلقيت استفسارك حول: "${text}". تذكر دائماً أن تجمع بين الجد والاجتهاد في الدراسة والاستعانة بالله وملازمة الأذكار.`;
      if (attachments && attachments.length > 0) {
        const types = attachments.map((a) => a.type);
        if (types.includes('camera')) {
          replyText = `أهلاً بك ${t('يا بطل 🇵🇸', 'يا بطلة 🇵🇸')}! تلقيت لقطة الكاميرا المباشرة للمسألة. أقوم بقراءة المعطيات وتفصيل خطوات الحل المنطقية خطوة بخطوة.`;
        } else if (types.includes('document')) {
          replyText = `أهلاً بك ${t('يا بطل 🇵🇸', 'يا بطلة 🇵🇸')}! تم استلام المستند الدراسي بنجاح. أقوم بتحليل محتواه واستخلاص النقاط الجوهرية والملخص الأكاديمي الشامل.`;
        } else if (types.includes('link')) {
          replyText = `أهلاً بك ${t('يا بطل 🇵🇸', 'يا بطلة 🇵🇸')}! اطلعت على الرابط المرجعي المرفق، وسأقوم بتلخيص أهم الأفكار والمعلومات الواردة فيه لخدمة دراستك.`;
        } else {
          replyText = `أهلاً بك ${t('يا بطل 🇵🇸', 'يا بطلة 🇵🇸')}! تم استلام ${
            attachments.length > 1 ? `${attachments.length} صور مرفقة` : 'الصورة المرفقة'
          }. أقوم بتحليل المسألة بدقة وتفكيك المعطيات؛ وسأوافيك بالحل والخطوات المنهجية الميسرة إن شاء الله.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `siraj_${Date.now()}`,
          sender: 'siraj',
          text: replyText,
          time: new Date().toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  return (
    <motion.section
      id="sirajHeroCard"
      aria-label="سراج المساعد الذكي ورفيق الطالب الفلسطيني"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.5, ease: customEase }}
      className="relative overflow-hidden rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 shadow-xl shadow-black/40 flex flex-col justify-between transition-colors duration-300 hover:border-amber-500/40 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.18)] group will-change-transform"
    >
      {/* Ambient Radial Glows */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ================= 1. HEADER: Branding, Status & Actions ================= */}
      <div className="relative z-10 p-4 border-b border-amber-500/15 flex items-center justify-between gap-2 bg-slate-950/50 backdrop-blur-md">
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
              className="absolute inset-0 rounded-2xl bg-amber-500/30 blur-md -z-10 pointer-events-none"
            />
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/25 via-amber-500/10 to-emerald-950/30 border border-amber-500/30 text-lg shadow-md shadow-amber-950/30">
              <span>💡</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-base sm:text-lg text-slate-100 tracking-tight font-serif whitespace-nowrap">
                سِـرَاج
              </h2>
              {/* Live Status Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>سراج حاضرٌ لمساعدتك في دراستك ووردك</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-normal truncate mt-0.5">
              رفيق الطالب الفلسطيني الذكي • يدعم الصور، الكاميرا، المستندات، والروابط
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <motion.button
            type="button"
            onClick={onOpenSettings}
            whileHover={{ scale: 1.05 }}
            whileTap={tapScale}
            className="text-xs font-semibold text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 rounded-xl border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="تهيئة مفتاح Google Gemini المجاني"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">تهيئة</span>
          </motion.button>

          {onToggleExpand && (
            <motion.button
              type="button"
              onClick={onToggleExpand}
              whileHover={{ scale: 1.08 }}
              whileTap={tapScale}
              className="text-slate-400 hover:text-amber-300 p-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-amber-500/20 transition flex items-center justify-center cursor-pointer"
              title={isExpanded ? 'تصغير' : 'توسيع نافذة المحادثة'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          )}

          <motion.button
            type="button"
            onClick={() => setMessages([messages[0]])}
            whileHover={{ scale: 1.08 }}
            whileTap={tapScale}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-rose-500/20 transition flex items-center justify-center cursor-pointer"
            title="تفريغ المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* ================= 2. CHAT / WORKSPACE MESSAGES AREA ================= */}
      <SirajMessageList
        messages={messages}
        className="flex-grow min-h-[320px] max-h-[460px]"
      />

      {/* ================= 3. QUICK ACTION PILLS BENEATH INPUT ================= */}
      <div className="relative z-10 px-4 py-2 border-t border-amber-500/10 bg-slate-950/40">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
          <span className="text-xs font-bold text-slate-300 pl-1 flex-shrink-0">مقترحات:</span>
          {quickPrompts.map((qp, i) => (
            <motion.button
              key={i}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={tapScale}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              onClick={() => handleSendMessage(qp.text)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>{qp.icon}</span>
              <span>{qp.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ================= 4. OMNICHANNEL MULTIMODAL INPUT BOX ================= */}
      <div className="relative z-10 p-3 sm:p-4 border-t border-amber-500/15 bg-slate-950/70">
        <SirajInput
          onSendMessage={handleSendMessage}
          placeholder="اسأل سِراج، أرفق مسألة/مستند/رابط، أو تحدّث صوتياً..."
        />
      </div>
    </motion.section>
  );
}
