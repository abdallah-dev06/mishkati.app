'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  FileSpreadsheet,
  Link2,
  Camera,
  Maximize2,
  FileBox,
  Layers
} from 'lucide-react';
import { SirajAttachment, formatAttachmentSize, MAX_TOTAL_ATTACHMENTS } from '../../lib/attachmentUtils';
import { tapScale, softSpring } from '../../lib/animations';

interface AttachmentPreviewListProps {
  attachments: SirajAttachment[];
  onRemove: (id: string) => void;
  onPreviewImage?: (previewUrl: string) => void;
}

export const AttachmentPreviewList: React.FC<AttachmentPreviewListProps> = ({
  attachments,
  onRemove,
  onPreviewImage
}) => {
  if (attachments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={softSpring}
      className="overflow-hidden mb-2"
    >
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-amber-500/20 backdrop-blur-xl overflow-x-auto no-scrollbar shadow-inner">
        {/* Counter Badge */}
        <span className="text-[10px] font-bold text-slate-400 px-1.5 whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>
            المرفقات ({attachments.length}/{MAX_TOTAL_ATTACHMENTS}):
          </span>
        </span>

        {/* Attachment Chips */}
        <AnimatePresence>
          {attachments.map((att) => {
            // 1. Image or Camera Snapshot
            if (att.type === 'image' || att.type === 'camera') {
              return (
                <motion.div
                  key={att.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.03 }}
                  className="relative group flex-shrink-0 rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 shadow-md"
                >
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover cursor-pointer"
                    onClick={() => att.previewUrl && onPreviewImage && onPreviewImage(att.previewUrl)}
                  />

                  {/* Camera Indicator Tag */}
                  {att.type === 'camera' && (
                    <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[8px] text-emerald-300 font-mono flex items-center gap-0.5">
                      <Camera className="w-2.5 h-2.5" />
                    </div>
                  )}

                  {/* Lightbox / Zoom hover overlay */}
                  <div
                    onClick={() => att.previewUrl && onPreviewImage && onPreviewImage(att.previewUrl)}
                    className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-300 drop-shadow" />
                  </div>

                  {/* Tiny floating delete button */}
                  <motion.button
                    type="button"
                    whileTap={tapScale}
                    onClick={() => onRemove(att.id)}
                    title="حذف المرفق"
                    className="absolute top-1 left-1 w-5 h-5 rounded-full bg-slate-950/80 text-slate-200 hover:text-rose-400 hover:bg-rose-950 border border-white/20 flex items-center justify-center transition cursor-pointer shadow-md"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </motion.button>
                </motion.div>
              );
            }

            // 2. Document (PDF, TXT, PPTX, DOCX)
            if (att.type === 'document') {
              const isPdf = att.name.toLowerCase().endsWith('.pdf');
              return (
                <motion.div
                  key={att.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-sky-500/30 text-sky-200 text-xs flex-shrink-0 max-w-[200px] shadow-sm group hover:border-sky-500/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                    {isPdf ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-grow text-right">
                    <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-sky-300">
                      {att.name}
                    </div>
                    {att.size && (
                      <div className="text-[9px] text-slate-400 font-mono">
                        {formatAttachmentSize(att.size)}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(att.id)}
                    title="حذف المستند"
                    className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition cursor-pointer flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            }

            // 3. Web or Resource Link
            if (att.type === 'link') {
              return (
                <motion.div
                  key={att.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-purple-500/30 text-purple-200 text-xs flex-shrink-0 max-w-[220px] shadow-sm group hover:border-purple-500/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-grow text-right">
                    <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-purple-300">
                      {att.name}
                    </div>
                    <div className="text-[9px] text-purple-300/80 font-mono truncate" dir="ltr">
                      {att.domain || att.url}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(att.id)}
                    title="حذف الرابط"
                    className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition cursor-pointer flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            }

            return null;
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
