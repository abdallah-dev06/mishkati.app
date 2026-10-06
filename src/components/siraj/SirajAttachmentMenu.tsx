'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paperclip,
  Image as ImageIcon,
  Camera,
  FileText,
  Link2,
  X
} from 'lucide-react';
import { subtleTap } from '../../lib/animations';

interface SirajAttachmentMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectImage: () => void;
  onOpenCamera: () => void;
  onSelectDocument: () => void;
  onOpenLinkModal: () => void;
  disabled?: boolean;
}

export const SirajAttachmentMenu: React.FC<SirajAttachmentMenuProps> = ({
  isOpen,
  onToggle,
  onClose,
  onSelectImage,
  onOpenCamera,
  onSelectDocument,
  onOpenLinkModal,
  disabled = false
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const menuItems = [
    {
      id: 'image',
      icon: <ImageIcon className="w-4 h-4 text-amber-400" />,
      label: 'صورة أو رسم بياني',
      subtitle: 'PNG, JPG, WEBP — أسئلة ورسومات',
      onClick: () => {
        onClose();
        onSelectImage();
      }
    },
    {
      id: 'camera',
      icon: <Camera className="w-4 h-4 text-emerald-400" />,
      label: 'التقاط بالكاميرا',
      subtitle: 'تصوير مسألة أو صفحة كتاب مباشرة',
      onClick: () => {
        onClose();
        onOpenCamera();
      }
    },
    {
      id: 'document',
      icon: <FileText className="w-4 h-4 text-sky-400" />,
      label: 'مستند دراسي أو عرض',
      subtitle: 'PDF, PPTX, DOCX, TXT — تلخيص وتحليل',
      onClick: () => {
        onClose();
        onSelectDocument();
      }
    },
    {
      id: 'link',
      icon: <Link2 className="w-4 h-4 text-purple-400" />,
      label: 'إدراج رابط مرجع أو مقال',
      subtitle: 'URL — تلخيص المحتوى واستخراج الأفكار',
      onClick: () => {
        onClose();
        onOpenLinkModal();
      }
    }
  ];

  return (
    <div ref={menuRef} className="relative inline-block">
      {/* Versatile Omnichannel Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={subtleTap}
        onClick={onToggle}
        disabled={disabled}
        title="إرفاق صورة، مستند، لقطة كاميرا، أو رابط لسِراج"
        className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-center flex-shrink-0 cursor-pointer shadow-md ${
          isOpen
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-950/40 ring-1 ring-amber-500/40 rotate-45'
            : 'bg-slate-900/90 hover:bg-amber-500/10 border-amber-500/25 text-slate-400 hover:text-amber-400 hover:border-amber-500/40'
        }`}
      >
        <Paperclip className="w-4 h-4 transition-transform duration-200" />
      </motion.button>

      {/* Animated Floating Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="absolute bottom-full right-0 z-40 mb-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-amber-500/25 p-2 shadow-2xl shadow-black/90 text-right select-none"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-amber-500/10 mb-1">
              <span className="text-[11px] font-bold text-amber-300/90 font-serif">
                إرفاق محتوى لسِراج
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="إغلاق القائمة"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Menu Items List */}
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 hover:bg-amber-500/15 hover:border-amber-500/30 border border-transparent group text-right cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:border-amber-500/40 transition-all shadow-inner">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
