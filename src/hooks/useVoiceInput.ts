'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Declaration for Web Speech API types
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
    webkitAudioContext?: typeof AudioContext;
  }
}

export interface UseVoiceInputOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  silenceTimeoutMs?: number;
  onTranscriptChange?: (text: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
}

export interface UseVoiceInputReturn {
  isListening: boolean;
  isRecordingFallback: boolean;
  transcript: string;
  interimTranscript: string;
  audioLevel: number; // 0 - 100 for waveform visualization
  hasSupport: boolean;
  permissionDenied: boolean;
  errorMessage: string | null;
  startListening: () => Promise<void>;
  stopListening: (keepTranscript?: boolean) => void;
  cancelListening: () => void;
  resetTranscript: () => void;
  audioBlob: Blob | null;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    lang = 'ar-PS',
    continuous = true,
    interimResults = true,
    silenceTimeoutMs = 6000,
    onTranscriptChange,
    onError
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isRecordingFallback, setIsRecordingFallback] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasSupport, setHasSupport] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // References to keep across renders
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Check support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      const mediaSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      setHasSupport(speechSupported || mediaSupported);
    }
  }, []);

  // Reset silence timer on speech
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (silenceTimeoutMs > 0) {
      silenceTimerRef.current = setTimeout(() => {
        stopListening(true);
      }, silenceTimeoutMs);
    }
  }, [silenceTimeoutMs]);

  // Clean up audio analyzer
  const cleanupAudioAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // Clean up media streams
  const cleanupMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    cleanupAudioAnalyser();
  }, [cleanupAudioAnalyser]);

  // Setup live audio visualizer
  const setupAudioLevelVisualizer = useCallback(
    (stream: MediaStream) => {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate average level
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          // Normalize to 0 - 100 scale
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          setAudioLevel(normalized);

          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err) {
        console.warn('Audio analyzer initialization failed:', err);
      }
    },
    []
  );

  // Stop listening helper
  const stopListening = useCallback(
    (keepTranscript: boolean = true) => {
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
        recognitionRef.current = null;
      }

      // Stop media recorder fallback
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }

      cleanupMediaStream();
      setIsListening(false);
      setIsRecordingFallback(false);

      if (!keepTranscript) {
        setTranscript('');
        setInterimTranscript('');
      } else {
        // Consolidate interim into final transcript
        setTranscript((prev) => {
          const finalVal = (prev + ' ' + interimTranscript).trim();
          if (onTranscriptChange && interimTranscript) {
            onTranscriptChange(finalVal, true);
          }
          return finalVal;
        });
        setInterimTranscript('');
      }
    },
    [interimTranscript, cleanupMediaStream, onTranscriptChange]
  );

  // Cancel listening helper
  const cancelListening = useCallback(() => {
    stopListening(false);
  }, [stopListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setAudioBlob(null);
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    setErrorMessage(null);
    setPermissionDenied(false);

    const SpeechRecognitionClass =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    // 1. Try Web Speech API first
    if (SpeechRecognitionClass) {
      try {
        // Request mic stream for audio level waveform visualization
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            setupAudioLevelVisualizer(stream);
          } catch (micErr: any) {
            if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
              setPermissionDenied(true);
              const errMsg = 'يرجى منح إذن استخدام الميكروفون للمتابعة';
              setErrorMessage(errMsg);
              if (onError) onError(errMsg);
              return;
            }
          }
        }

        const recognition = new SpeechRecognitionClass();
        recognition.lang = lang;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          resetSilenceTimer();
        };

        recognition.onresult = (event: any) => {
          resetSilenceTimer();
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const transcriptPart = result[0].transcript;
            if (result.isFinal) {
              currentFinal += transcriptPart;
            } else {
              currentInterim += transcriptPart;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => {
              const updated = (prev + ' ' + currentFinal).trim();
              if (onTranscriptChange) onTranscriptChange(updated, true);
              return updated;
            });
          }

          setInterimTranscript(currentInterim);
          if (onTranscriptChange && currentInterim) {
            onTranscriptChange(currentInterim, false);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setPermissionDenied(true);
            const msg = 'يرجى منح إذن استخدام الميكروفون للمتابعة';
            setErrorMessage(msg);
            if (onError) onError(msg);
            stopListening(true);
          } else if (event.error === 'no-speech') {
            // Silence detected; will be handled by silence timer
          } else if (event.error === 'network') {
            // Language model network fallback: retry with general Arabic
            if (recognition.lang === 'ar-PS') {
              recognition.lang = 'ar-SA';
            }
          } else {
            setErrorMessage(`خطأ في الإدخال الصوتي: ${event.error}`);
          }
        };

        recognition.onend = () => {
          // If still marked as listening and continuous is expected
          setIsListening(false);
          cleanupMediaStream();
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (speechErr: any) {
        console.warn('SpeechRecognition failed, falling back to MediaRecorder:', speechErr);
      }
    }

    // 2. Fallback: Audio Recording via MediaRecorder
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setupAudioLevelVisualizer(stream);

        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          setAudioBlob(blob);
          cleanupMediaStream();
          setIsListening(false);
          setIsRecordingFallback(false);
        };

        recorder.start(250);
        setIsListening(true);
        setIsRecordingFallback(true);
        resetSilenceTimer();
      } catch (recErr: any) {
        if (recErr.name === 'NotAllowedError' || recErr.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          const errMsg = 'يرجى منح إذن استخدام الميكروفون للمتابعة';
          setErrorMessage(errMsg);
          if (onError) onError(errMsg);
        } else {
          setErrorMessage('تعذر الوصول إلى الميكروفون على هذا الجهاز');
        }
      }
    } else {
      const errMsg = 'المتصفح لا يدعم ميزة الإدخال الصوتي أو تسجيل الصوت';
      setErrorMessage(errMsg);
      if (onError) onError(errMsg);
    }
  }, [
    lang,
    continuous,
    interimResults,
    resetSilenceTimer,
    setupAudioLevelVisualizer,
    cleanupMediaStream,
    stopListening,
    onTranscriptChange,
    onError
  ]);

  // Clean up all timers and streams on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      cleanupMediaStream();
    };
  }, [cleanupMediaStream]);

  return {
    isListening,
    isRecordingFallback,
    transcript,
    interimTranscript,
    audioLevel,
    hasSupport,
    permissionDenied,
    errorMessage,
    startListening,
    stopListening,
    cancelListening,
    resetTranscript,
    audioBlob
  };
}
