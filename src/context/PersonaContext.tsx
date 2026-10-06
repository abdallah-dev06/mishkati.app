'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Persona = 'muthabir' | 'muthabira';

export interface PersonaTokens {
  primaryRgb: string;
  secondaryRgb: string;
  glow: string;
  border: string;
  subtle: string;
  label: string;
  badge: string;
}

export const PERSONA_TOKENS: Record<Persona, PersonaTokens> = {
  muthabir: {
    primaryRgb: '245, 158, 11',      // Golden Amber #F59E0B
    secondaryRgb: '217, 119, 6',     // Deep Warm Amber #D97706
    glow: 'rgba(245, 158, 11, 0.25)',
    border: 'rgba(245, 158, 11, 0.2)',
    subtle: 'rgba(245, 158, 11, 0.1)',
    label: 'مُثابِر',
    badge: 'نمط الفتى المُثابِر'
  },
  muthabira: {
    primaryRgb: '244, 114, 182',     // Warm Rose Gold / Blossom Pink #F472B6
    secondaryRgb: '225, 29, 72',     // Dusty Rose / Coral Accent #E11D48
    glow: 'rgba(244, 114, 182, 0.25)',
    border: 'rgba(244, 114, 182, 0.25)',
    subtle: 'rgba(244, 114, 182, 0.1)',
    label: 'مُثابِرة',
    badge: 'نمط الفتاة المُثابِرة'
  }
};

export interface PersonaContextValue {
  persona: Persona;
  setPersona: (p: Persona) => void;
  togglePersona: () => void;
  isMuthabira: boolean;
  tokens: PersonaTokens;
  t: (masculine: string, feminine: string) => string;
}

const PersonaContext = createContext<PersonaContextValue | undefined>(undefined);

const STORAGE_KEY = 'mishkati_persona';

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>('muthabir');
  const [mounted, setMounted] = useState(false);

  // Apply CSS variables and data-persona attribute to document element
  const applyPersonaToDOM = useCallback((p: Persona) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;
    
    root.setAttribute('data-persona', p);
    if (body) {
      body.setAttribute('data-persona', p);
    }

    const t = PERSONA_TOKENS[p];
    root.style.setProperty('--accent-primary', t.primaryRgb);
    root.style.setProperty('--accent-secondary', t.secondaryRgb);
    root.style.setProperty('--accent-glow', t.glow);
    root.style.setProperty('--accent-border', t.border);
    root.style.setProperty('--accent-subtle', t.subtle);

    // Notify non-React listeners
    window.dispatchEvent(
      new CustomEvent('mishkati_persona_changed', {
        detail: { persona: p, tokens: t }
      })
    );
  }, []);

  // Hydrate from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Persona | null;
      if (saved === 'muthabir' || saved === 'muthabira') {
        setPersonaState(saved);
        applyPersonaToDOM(saved);
      } else {
        applyPersonaToDOM('muthabir');
      }
    } catch {
      applyPersonaToDOM('muthabir');
    }
    setMounted(true);
  }, [applyPersonaToDOM]);

  const setPersona = useCallback((newPersona: Persona) => {
    setPersonaState(newPersona);
    applyPersonaToDOM(newPersona);
    try {
      localStorage.setItem(STORAGE_KEY, newPersona);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [applyPersonaToDOM]);

  const togglePersona = useCallback(() => {
    setPersona(persona === 'muthabir' ? 'muthabira' : 'muthabir');
  }, [persona, setPersona]);

  // Translation helper for gender-adaptive Arabic text
  const t = useCallback((masculine: string, feminine: string): string => {
    return persona === 'muthabira' ? feminine : masculine;
  }, [persona]);

  const contextValue: PersonaContextValue = {
    persona,
    setPersona,
    togglePersona,
    isMuthabira: persona === 'muthabira',
    tokens: PERSONA_TOKENS[persona],
    t
  };

  return (
    <PersonaContext.Provider value={contextValue}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    // Graceful fallback for non-provider renders
    return {
      persona: 'muthabir',
      setPersona: () => {},
      togglePersona: () => {},
      isMuthabira: false,
      tokens: PERSONA_TOKENS.muthabir,
      t: (masculine: string) => masculine
    };
  }
  return ctx;
}
