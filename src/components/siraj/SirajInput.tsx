'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Send,
  X,
  AlertCircle,
  Check,
  UploadCloud
} from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import {
  SirajAttachment,
  processImageFileAttachment,
  processCameraSnapshotAttachment,
  processDocumentFileAttachment,
  createLinkAttachment,
  MAX_TOTAL_ATTACHMENTS
} from '../../lib/attachmentUtils';
import { extractImagesFromClipboard, extractImagesFromDataTransfer } from '../../lib/imageUtils';
import { tapScale, subtleTap } from '../../lib/animations';
import { SirajAttachmentMenu } from './SirajAttachmentMenu';
import { CameraCaptureModal } from './CameraCaptureModal';
import { LinkInputModal } from './LinkInputModal';
import { AttachmentPreviewList } from './AttachmentPreviewList';

export const DEFAULT_MULTIMODAL_PROMPT =
  'تفضّل بتحليل هذا المحتوى المرفق وشرحه أو حل المسألة الموضحة فيه خطوة بخطوة بطريقة تعليمية ميسّرة.';

interface SirajInputProps {
  onSendMessage: (query: string, attachments?: SirajAttachment[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onPreviewImage?: (previewUrl: string) => void;
}

export const SirajInput: React.FC<SirajInputProps> = ({
  onSendMessage,
  placeholder = 'اسأل سِراج، أرفق مسألة بالصورة، أو تحدّث صوتياً...',
  disabled = false,
  onPreviewImage
}) => {
  const [inputText, setInputText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<SirajAttachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Omnichannel Modals State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef<number>(0);

  const {
    isListening,
    transcript,
    interimTranscript,
    audioLevel,
    hasSupport,
    permissionDenied,
    errorMessage,
    startListening,
    stopListening,
    cancelListening,
    resetTranscript
  } = useVoiceInput({
    lang: 'ar-PS',
    continuous: true,
    interimResults: true,
    silenceTimeoutMs: 6000,
    onTranscriptChange: (text) => {
      setInputText(text);
    },
    onError: (err) => {
      setToastMessage(err);
      setTimeout(() => setToastMessage(null), 3500);
    }
  });

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Add multiple processed attachments checking limits
  const addAttachments = useCallback((newItems: SirajAttachment[]) => {
    setAttachments((prev) => {
      if (prev.length + newItems.length > MAX_TOTAL_ATTACHMENTS) {
        setToastMessage(`يمكنك إرفاق حتى ${MAX_TOTAL_ATTACHMENTS} عناصر كحد أقصى لكل سؤال.`);
        setTimeout(() => setToastMessage(null), 4000);
      }
      const available = MAX_TOTAL_ATTACHMENTS - prev.length;
      return [...prev, ...newItems.slice(0, Math.max(0, available))];
    });
  }, []);

  // Process Images from file picker
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    e.target.value = '';

    setIsProcessing(true);
    try {
      const processed: SirajAttachment[] = [];
      for (const file of files) {
        const item = await processImageFileAttachment(file);
        processed.push(item);
      }
      addAttachments(processed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تجهيز الصورة المرفقة.';
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Educational Documents (PDF, PPTX, DOCX, TXT)
  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    e.target.value = '';

    setIsProcessing(true);
    try {
      const processed: SirajAttachment[] = [];
      for (const file of files) {
        const item = await processDocumentFileAttachment(file);
        processed.push(item);
      }
      addAttachments(processed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تجهيز المستند المرفق.';
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Camera Snapshot
  const handleCameraCapture = (dataUrl: string) => {
    const item = processCameraSnapshotAttachment(dataUrl);
    addAttachments([item]);
  };

  // Process External Link
  const handleAddLink = (url: string, title?: string) => {
    const item = createLinkAttachment(url, title);
    addAttachments([item]);
  };

  // Remove single attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Clipboard Paste Handler (Ctrl + V for screenshots or links)
  const handlePaste = async (e: React.ClipboardEvent) => {
    // 1. Check for pasted images
    const pastedImages = extractImagesFromClipboard(e);
    if (pastedImages.length > 0) {
      e.preventDefault();
      setIsProcessing(true);
      try {
        const processed: SirajAttachment[] = [];
        for (const file of pastedImages) {
          const item = await processImageFileAttachment(file);
          processed.push(item);
        }
        addAttachments(processed);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'فشل معالجة لقطة الشاشة الملصقة.';
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // 2. Check for pasted URL text
    const clipboardText = e.clipboardData?.getData('text') || '';
    if (clipboardText.startsWith('http://') || clipboardText.startsWith('https://')) {
      // If user holds Ctrl while input is empty or focuses, suggest adding as link attachment
      if (!inputText.trim()) {
        e.preventDefault();
        handleAddLink(clipboardText.trim());
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.types?.includes('Files')) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const processed: SirajAttachment[] = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const imgItem = await processImageFileAttachment(file);
          processed.push(imgItem);
        } else {
          try {
            const docItem = await processDocumentFileAttachment(file);
            processed.push(docItem);
          } catch (docErr) {
            console.warn('Skipped non-supported file:', docErr);
          }
        }
      }
      if (processed.length > 0) {
        addAttachments(processed);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Voice Toggle
  const handleToggleVoice = async () => {
    if (disabled) return;
    if (isListening) {
      stopListening(true);
      inputRef.current?.focus();
    } else {
      resetTranscript();
      await startListening();
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening(true);
    }

    const cleanText = inputText.trim();
    const hasAttachments = attachments.length > 0;

    if (!cleanText && !hasAttachments) return;
    if (disabled || isProcessing) return;

    const finalPrompt = cleanText || DEFAULT_MULTIMODAL_PROMPT;

    onSendMessage(finalPrompt, hasAttachments ? attachments : undefined);

    setInputText('');
    setAttachments([]);
    resetTranscript();
  };

  // Clear Input
  const handleClear = () => {
    setInputText('');
    resetTranscript();
    inputRef.current?.focus();
  };

  return (
    <div
      onPaste={handlePaste}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative w-full space-y-2 select-none"
    >
      {/* Hidden Native File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        multiple
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf, .pptx, .docx, .txt, application/pdf, text/plain"
        multiple
        className="hidden"
        onChange={handleDocFileChange}
      />

      {/* Omnichannel Modals */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
      <LinkInputModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onAddLink={handleAddLink}
      />

      {/* Drag & Drop Active Overlay */}
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 rounded-2xl border-2 border-dashed border-amber-400 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-2 p-4 text-center pointer-events-none shadow-2xl shadow-amber-950/50"
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl shadow-inner border border-amber-500/30"
            >
              <UploadCloud className="w-6 h-6 text-amber-400" />
            </motion.div>
            <div className="font-serif font-black text-amber-300 text-sm sm:text-base">
              «أَفْلِتِ الصُّورَةَ أَوِ المِلَفَّ هُنَا لِيَقُومَ سِرَاجٌ بِتَحْلِيلِهِ»
            </div>
            <p className="text-[11px] text-slate-300 max-w-xs">
              مسألة رياضية، ملف PDF، عرض تقديمي، أو رسم تخطيطي — سيحلله سراج خطوة بخطوة
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error / Alert Toast */}
      {(toastMessage || permissionDenied || errorMessage) && (
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs animate-fadeIn shadow-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span className="flex-grow font-medium">
            {permissionDenied
              ? 'يرجى منح إذن استخدام الميكروفون للمتابعة'
              : toastMessage || errorMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-rose-400 hover:text-rose-200 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Omnichannel Attachment Queue Bar (Pre-dispatch Canvas) */}
      <AttachmentPreviewList
        attachments={attachments}
        onRemove={handleRemoveAttachment}
        onPreviewImage={onPreviewImage}
      />

      {/* Live Voice Recording Status Banner */}
      {isListening && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-950/60 border border-red-500/40 shadow-inner text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>

            <div className="flex items-center gap-0.5 h-4 px-1" title="مستوى الصوت">
              <span
                className="w-1 bg-red-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, (audioLevel / 100) * 16)}px` }}
              />
              <span
                className="w-1 bg-amber-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(6, (audioLevel / 100) * 20)}px` }}
              />
              <span
                className="w-1 bg-red-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(8, (audioLevel / 100) * 22)}px` }}
              />
              <span
                className="w-1 bg-amber-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, (audioLevel / 100) * 14)}px` }}
              />
            </div>

            <div className="min-w-0 flex items-center gap-1.5 text-[11px]">
              <span className="font-bold text-red-300 whitespace-nowrap">جاري الاستماع:</span>
              <span className="text-slate-200 italic truncate max-w-[200px] sm:max-w-xs">
                {interimTranscript || inputText || 'تحدّث الآن باللغة العربية...'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => stopListening(true)}
              className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/35 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              title="تثبيت النص وإيقاف الميكروفون"
            >
              <Check className="w-3 h-3" />
              <span>تم</span>
            </button>
            <button
              type="button"
              onClick={cancelListening}
              className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/35 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              title="إلغاء التسجيل"
            >
              <X className="w-3 h-3" />
              <span>إلغاء</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Input Form Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              attachments.length > 0
                ? 'أضف تعليماتك حول المحتوى المرفق (أو اضغط إرسال للتحليل)...'
                : isListening
                ? 'سِراج يستمع لصوتك الآن...'
                : placeholder
            }
            disabled={disabled || isProcessing}
            className={`w-full bg-slate-900/95 border rounded-2xl pr-3.5 pl-9 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-inner transition ${
              isListening
                ? 'border-red-500/40 ring-1 ring-red-500/30 placeholder-red-300/60'
                : 'border-amber-500/25 focus:ring-amber-500/50'
            }`}
            autoComplete="off"
            dir="auto"
          />

          {/* Clear text button */}
          {inputText && (
            <button
              type="button"
              onClick={handleClear}
              title="مسح النص"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-300 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Omnichannel Attachment Menu Button */}
        <SirajAttachmentMenu
          isOpen={isMenuOpen}
          onToggle={() => setIsMenuOpen(!isMenuOpen)}
          onClose={() => setIsMenuOpen(false)}
          onSelectImage={() => imageInputRef.current?.click()}
          onOpenCamera={() => setIsCameraOpen(true)}
          onSelectDocument={() => docInputRef.current?.click()}
          onOpenLinkModal={() => setIsLinkModalOpen(true)}
          disabled={disabled || isProcessing}
        />

        {/* Real-time Voice Input Button */}
        {hasSupport && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={subtleTap}
            onClick={handleToggleVoice}
            disabled={disabled}
            title={
              isListening
                ? 'جاري الاستماع... انقر للإيقاف'
                : 'تحدث مع سِراج بصوتك (إدخال صوتي)'
            }
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-center flex-shrink-0 cursor-pointer shadow-md relative group ${
              isListening
                ? 'bg-rose-500/25 border-rose-500/60 text-rose-300 ring-2 ring-rose-500/40 animate-pulse shadow-rose-950/50'
                : 'bg-slate-900/90 hover:bg-amber-500/10 border-amber-500/25 text-slate-400 hover:text-amber-400 hover:border-amber-500/40'
            }`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-rose-400" />
            ) : (
              <Mic className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
            )}
            {isListening && (
              <span className="absolute -inset-1 rounded-2xl bg-rose-500/20 blur-sm pointer-events-none animate-pulse" />
            )}
          </motion.button>
        )}

        {/* Dispatch Send Button */}
        <motion.button
          type="submit"
          disabled={disabled || (!inputText.trim() && attachments.length === 0) || isProcessing}
          whileHover={{ scale: inputText.trim() || attachments.length > 0 ? 1.03 : 1 }}
          whileTap={inputText.trim() || attachments.length > 0 ? tapScale : undefined}
          title="إرسال لسِراج لتحليل السؤال أو المرفقات"
          className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-950/40 transition-all cursor-pointer flex-shrink-0"
        >
          <span>{attachments.length > 0 && !inputText.trim() ? 'تحليل' : 'إرسال'}</span>
          <Send className="w-3.5 h-3.5 rotate-180" />
        </motion.button>
      </form>
    </div>
  );
};

export default SirajInput;
