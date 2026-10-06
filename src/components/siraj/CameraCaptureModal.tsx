'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  SwitchCamera,
  AlertCircle
} from 'lucide-react';
import { tapScale, subtleTap } from '../../lib/animations';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isLoading, setIsLoading] = useState(false);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start camera with requested facing mode
  const startCamera = useCallback(async () => {
    stopStream();
    setCameraError(null);
    setIsLoading(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('المتصفح الحالي لا يدعم الوصول للكاميرا المباشرة.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch {
        // Fallback with basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر فتح الكاميرا.';
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setCameraError('يرجى منح إذن استخدام الكاميرا من إعدادات المتصفح.');
      } else {
        setCameraError('تعذر تشغيل الكاميرا. تأكد من عدم استخدامها بواسطة تطبيق آخر.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera();
    } else {
      stopStream();
      setCapturedImage(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Handle snap photo
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user (selfie) facing mode, flip horizontally for natural mirror look
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    stopStream();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  // Toggle front/back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/30 overflow-hidden shadow-2xl text-slate-100 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-amber-500/15 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm border border-amber-500/30">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-serif">
                  التقاط مسألة بالكاميرا
                </h3>
                <p className="text-[10px] text-slate-400">
                  صوّر المسألة أو صفحة الكتاب مباشرة ليحللها سِراج
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Viewfinder Canvas Area */}
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
            {cameraError ? (
              <div className="p-6 text-center space-y-3 max-w-sm">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <p className="text-xs text-rose-300 leading-relaxed font-medium">
                  {cameraError}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : capturedImage ? (
              /* Captured Image Preview */
              <img
                src={capturedImage}
                alt="لقطة الكاميرا"
                className="w-full h-full object-contain"
              />
            ) : (
              /* Live Camera Stream Video */
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* Viewfinder Target Framing UI */}
                <div className="absolute inset-6 border border-white/25 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr" />
                    <span className="w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl" />
                  </div>
                  <div className="text-center text-[10px] text-white/70 bg-black/40 px-3 py-1 rounded-full mx-auto backdrop-blur-xs font-mono">
                    اضبط المسألة داخل الإطار
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br" />
                    <span className="w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl" />
                  </div>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-amber-300 text-xs font-medium">
                    جاري تشغيل الكاميرا...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action HUD Controls */}
          <div className="p-4 bg-slate-950/80 border-t border-amber-500/15 flex items-center justify-between gap-3">
            {capturedImage ? (
              <>
                <motion.button
                  type="button"
                  whileTap={tapScale}
                  onClick={handleRetake}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>التقاط مجدداً</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={tapScale}
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>استخدام اللقطة ✓</span>
                </motion.button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  title="تبديل الكاميرا (الأمامية / الخلفية)"
                  className="p-3 rounded-2xl bg-slate-800/80 hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/30 transition cursor-pointer"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>

                {/* Shutter Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  disabled={isLoading || Boolean(cameraError)}
                  onClick={takeSnapshot}
                  title="التقاط الصورة الآن"
                  className="relative p-1 rounded-full border-2 border-amber-400 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 flex items-center justify-center shadow-lg shadow-amber-950/50 transition">
                    <Camera className="w-6 h-6 text-slate-950" />
                  </div>
                </motion.button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition cursor-pointer"
                >
                  إلغاء
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
