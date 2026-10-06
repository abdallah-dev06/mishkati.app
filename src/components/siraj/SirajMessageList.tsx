'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Maximize2,
  FileImage,
  FileText,
  FileSpreadsheet,
  Link2,
  ExternalLink,
  Camera
} from 'lucide-react';
import { customEase } from '../../lib/animations';
import { usePersona } from '../../context/PersonaContext';
import { formatAttachmentSize } from '../../lib/attachmentUtils';

export interface MessageAttachment {
  id: string;
  type?: 'image' | 'camera' | 'document' | 'link';
  previewUrl?: string;
  name?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  domain?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'siraj';
  text: string;
  time: string;
  attachments?: MessageAttachment[];
  isStreaming?: boolean;
}

interface SirajMessageListProps {
  messages: ChatMessage[];
  className?: string;
}

export const SirajMessageList: React.FC<SirajMessageListProps> = ({
  messages,
  className = ''
}) => {
  const { tokens } = usePersona();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Close Lightbox on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
        setZoomLevel(1);
      }
    },
    [selectedImage]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const openLightbox = (url: string) => {
    setSelectedImage(url);
    setZoomLevel(1);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 0.7));
  const resetZoom = () => setZoomLevel(1);

  return (
    <div className={`space-y-4 overflow-y-auto px-4 py-3 ${className}`}>
      <AnimatePresence initial={false}>
        {messages.map((m) => {
          if (m.sender === 'user') {
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: customEase }}
                className="flex items-start gap-2.5 justify-end text-right"
              >
                <div className="space-y-2 max-w-[88%] sm:max-w-[78%] bg-amber-500/20 border border-amber-500/35 p-3.5 rounded-2xl rounded-tl-none text-xs sm:text-sm text-slate-100 leading-relaxed shadow-sm">
                  {/* Omnichannel User Attached Items Previews */}
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-0.5 pb-1">
                      {m.attachments.map((att, idx) => {
                        const attType = att.type || (att.previewUrl ? 'image' : 'document');

                        // 1. Image / Camera Snapshot
                        if ((attType === 'image' || attType === 'camera') && att.previewUrl) {
                          return (
                            <div
                              key={att.id || idx}
                              onClick={() => openLightbox(att.previewUrl!)}
                              className="group relative cursor-pointer overflow-hidden rounded-xl border border-amber-400/40 bg-slate-950/60 shadow-md transition-all hover:scale-105 hover:border-amber-400"
                              title="اضغط لمعاينة الصورة بالحجم الكامل"
                            >
                              <img
                                src={att.previewUrl}
                                alt={att.name || 'مرفق الطالب'}
                                className="h-20 w-20 sm:h-24 sm:w-24 object-cover"
                              />
                              {attType === 'camera' && (
                                <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[8px] text-emerald-300 font-mono flex items-center gap-0.5">
                                  <Camera className="w-2.5 h-2.5" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-4 h-4 text-amber-300 drop-shadow" />
                              </div>
                            </div>
                          );
                        }

                        // 2. Document (PDF, PPTX, DOCX, TXT)
                        if (attType === 'document') {
                          const isPdf = att.name?.toLowerCase().endsWith('.pdf');
                          return (
                            <div
                              key={att.id || idx}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/70 border border-sky-500/40 text-sky-200 text-xs shadow-sm max-w-[220px]"
                            >
                              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center flex-shrink-0">
                                {isPdf ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0 flex-grow text-right">
                                <div className="text-[11px] font-bold text-slate-100 truncate">
                                  {att.name || 'مستند دراسي'}
                                </div>
                                {att.size && (
                                  <div className="text-[9px] text-slate-400 font-mono">
                                    {formatAttachmentSize(att.size)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        // 3. Web Link
                        if (attType === 'link') {
                          return (
                            <a
                              key={att.id || idx}
                              href={att.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/70 border border-purple-500/40 text-purple-200 text-xs shadow-sm hover:border-purple-400 transition-colors max-w-[240px]"
                            >
                              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0">
                                <Link2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-grow text-right">
                                <div className="text-[11px] font-bold text-slate-100 truncate">
                                  {att.name || 'رابط مرجع'}
                                </div>
                                <div className="text-[9px] text-purple-300/80 font-mono truncate" dir="ltr">
                                  {att.domain || att.url}
                                </div>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            </a>
                          );
                        }

                        return null;
                      })}
                    </div>
                  )}

                  {/* User Prompt Text */}
                  {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}

                  <div className="text-[10px] text-amber-300/70 text-left font-mono">{m.time}</div>
                </div>
              </motion.div>
            );
          }

          // Siraj AI Bubble
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: customEase }}
              className="flex items-start gap-3 text-right"
            >
              {/* Siraj Bot Avatar */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md shadow-amber-950/40">
                💡
              </div>

              {/* Siraj Response Bubble */}
              <div className="space-y-2 max-w-[92%] sm:max-w-[85%] bg-slate-800/90 p-4 rounded-2xl rounded-tr-none border border-amber-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-lg">
                <div className="font-bold text-amber-300 flex items-center justify-between gap-1.5 text-xs pb-1.5 border-b border-amber-500/10">
                  <div className="flex items-center gap-1.5">
                    <span>سِراج رفيقك</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full font-mono font-bold">
                      AI
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(m.id, m.text)}
                      title="نسخ الإجابة"
                      className="text-slate-400 hover:text-amber-300 p-1 rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Formatted Content */}
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1 space-y-2 whitespace-pre-wrap">
                  {m.text}
                </div>

                <div className="text-[10px] text-slate-400 pt-1 text-left font-mono">{m.time}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Full-Screen Lightbox Modal for Image & Camera Inspection */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 sm:p-6"
          >
            {/* Top Toolbar */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 inset-x-4 max-w-xl mx-auto flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-2xl backdrop-blur-lg z-10"
            >
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold px-2">
                <FileImage className="w-4 h-4 text-amber-400" />
                <span>معاينة الصورة المرفقة لسِراج</span>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={zoomIn}
                  title="تكبير"
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/30 transition cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={zoomOut}
                  title="تصغير"
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/30 transition cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  title="إعادة ضبط القياس"
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/30 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <a
                  href={selectedImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="فتح في نافذة مستقلة"
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/30 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={closeLightbox}
                  title="إغلاق (Esc)"
                  className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Centered Image Viewer */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-full max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900/50 shadow-2xl"
            >
              <motion.img
                key={selectedImage}
                src={selectedImage}
                alt="معاينة كاملة"
                animate={{ scale: zoomLevel }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl select-none"
              />
            </div>

            {/* Hint footer */}
            <div className="absolute bottom-4 text-center text-[11px] text-slate-400 select-none">
              اضغط خارج الصورة أو اضغط <span className="font-mono text-amber-300">Esc</span> للإغلاق
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
