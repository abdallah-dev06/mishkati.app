'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, X, Globe, Plus, AlertCircle } from 'lucide-react';
import { tapScale } from '../../lib/animations';
import { validateAndNormalizeUrl, extractDomainFromUrl } from '../../lib/attachmentUtils';

interface LinkInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (url: string, title?: string) => void;
}

export const LinkInputModal: React.FC<LinkInputModalProps> = ({
  isOpen,
  onClose,
  onAddLink
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateAndNormalizeUrl(urlInput);
    if (!validation.valid || !validation.normalizedUrl) {
      setError(validation.error || 'يرجى إدخال رابط صحيح يبدأ بـ https://');
      return;
    }

    onAddLink(validation.normalizedUrl, titleInput.trim() || undefined);
    setUrlInput('');
    setTitleInput('');
    onClose();
  };

  const detectedDomain = urlInput.trim() ? extractDomainFromUrl(urlInput) : null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/30 overflow-hidden shadow-2xl text-slate-100 p-5 space-y-4 text-right"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-sm shadow-inner">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-serif">
                  إدراج رابط مرجع أو مقال
                </h3>
                <p className="text-[10px] text-slate-400">
                  سيقوم سِراج بالاطلاع على الرابط واستخراج الأفكار الرئيسية
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                عنوان الرابط الإلكتروني (URL):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="https://example.com/article-or-paper..."
                  className="w-full bg-slate-950/90 border border-amber-500/25 rounded-2xl pr-3 pl-8 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-left"
                  dir="ltr"
                  autoFocus
                />
                <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {detectedDomain && detectedDomain !== 'رابط خارجي' && (
                <div className="text-[10px] text-purple-300 font-mono mt-1">
                  الموقع المحدد: <span className="font-bold underline">{detectedDomain}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                عنوان توضيحي للرابط (اختياري):
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="مثال: مقال ويكيبيديا حول المتجهات في الفيزياء"
                className="w-full bg-slate-950/90 border border-amber-500/25 rounded-2xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition cursor-pointer"
              >
                إلغاء
              </button>

              <motion.button
                type="submit"
                whileTap={tapScale}
                disabled={!urlInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/40 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إدراج الرابط</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
