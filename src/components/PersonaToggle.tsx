'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Flower2 } from 'lucide-react';
import { usePersona, Persona } from '../context/PersonaContext';
import { tapScale, softSpring } from '../lib/animations';

interface PersonaToggleProps {
  className?: string;
  showLabels?: boolean;
}

export default function PersonaToggle({ className = '', showLabels = true }: PersonaToggleProps) {
  const { persona, setPersona } = usePersona();

  const options: Array<{
    id: Persona;
    label: string;
    icon: React.ReactNode;
    title: string;
    activeClass: string;
    activeText: string;
  }> = [
    {
      id: 'muthabir',
      label: 'مُثابِر',
      icon: <Compass className="w-3.5 h-3.5" />,
      title: 'نمط مُثابِر • السمة الكهرمانية الذهبية والخطاب العام',
      activeClass: 'from-amber-500/25 via-amber-500/20 to-amber-600/20 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      activeText: 'text-amber-300'
    },
    {
      id: 'muthabira',
      label: 'مُثابِرة',
      icon: <Flower2 className="w-3.5 h-3.5" />,
      title: 'نمط مُثابِرة • سمة الذهب الوردي المخملي والخطاب المؤنث الكريم',
      activeClass: 'from-pink-500/25 via-rose-500/20 to-pink-600/20 border-pink-400/40 shadow-[0_0_12px_rgba(244,114,182,0.25)]',
      activeText: 'text-pink-300'
    }
  ];

  return (
    <div
      role="radiogroup"
      aria-label="اختيار نمط المنصة ومخاطبة الطالب أو الطالبة"
      className={`relative inline-flex items-center p-1 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-inner select-none ${className}`}
    >
      {options.map((opt) => {
        const isActive = persona === opt.id;

        return (
          <motion.button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            whileTap={tapScale}
            onClick={() => setPersona(opt.id)}
            title={opt.title}
            className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer duration-200 ${
              isActive
                ? opt.activeText
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Sliding Framer Motion Indicator */}
            {isActive && (
              <motion.div
                layoutId="persona-active-pill"
                transition={softSpring}
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${opt.activeClass} border pointer-events-none -z-10`}
              />
            )}

            <span className="flex-shrink-0">{opt.icon}</span>
            {showLabels && <span className="font-serif tracking-wide">{opt.label}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
