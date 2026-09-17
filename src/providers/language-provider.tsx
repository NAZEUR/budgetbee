"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, dictionaries } from "@/i18n/dictionaries";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load language from localStorage if available
    const savedLang = localStorage.getItem("budgetbee_lang") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "id")) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("budgetbee_lang", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dictionary = dictionaries[language];
      if (!dictionary) return key;
      return dictionary[key] || key; // fallback to key if missing
    },
    [language]
  );

  // Prevent hydration mismatch by returning empty during SSR if needed, 
  // but since we only swap text, it's usually fine. However, to avoid 
  // flickering on the server, returning a default or waiting is best.
  // In Next.js, a small flicker might occur if default is en and local is id.
  // We'll let it render with the default state and hydrate to avoid full unmounts.
  // But wait, if hydration mismatches text, React might complain.
  // It's safer to just render children, React 18 handles text mismatches tolerably well.
  
  if (!mounted) {
    // Render with default language (en) on server to match SSR
    return (
      <LanguageContext.Provider value={{ language: "en", setLanguage, t: (key) => dictionaries["en"][key] || key }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
