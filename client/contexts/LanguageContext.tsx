import React, { createContext, useContext, useEffect, useState } from "react";

export type LanguageCode = "en" | "hi" | "ta" | "te" | "kn" | "bn" | "mr" | "gu" | "pa" | "or" | "ur";

const INDIAN_LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
  { code: "ur", name: "اردو (Urdu)" },
];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  languages: typeof INDIAN_LANGUAGES;
  isInitialized: boolean;
  translations: Record<string, any>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Import all translations
import enTranslations from "@/translations/en.json";
import hiTranslations from "@/translations/hi.json";
import taTranslations from "@/translations/ta.json";
import teTranslations from "@/translations/te.json";
import knTranslations from "@/translations/kn.json";
import bnTranslations from "@/translations/bn.json";
import mrTranslations from "@/translations/mr.json";
import guTranslations from "@/translations/gu.json";
import paTranslations from "@/translations/pa.json";
import orTranslations from "@/translations/or.json";
import urTranslations from "@/translations/ur.json";

const allTranslations: Record<LanguageCode, Record<string, any>> = {
  en: enTranslations,
  hi: hiTranslations,
  ta: taTranslations,
  te: teTranslations,
  kn: knTranslations,
  bn: bnTranslations,
  mr: mrTranslations,
  gu: guTranslations,
  pa: paTranslations,
  or: orTranslations,
  ur: urTranslations,
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("userLanguage") as LanguageCode | null;
    const defaultLanguage = savedLanguage || "en";
    setLanguageState(defaultLanguage);
    document.documentElement.lang = defaultLanguage;
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("userLanguage", lang);
    document.documentElement.lang = lang;
  };

  const getCurrentTranslations = () => {
    return allTranslations[language] || allTranslations.en;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: INDIAN_LANGUAGES,
        isInitialized,
        translations: getCurrentTranslations(),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Simple translation helper
export const useTranslation = () => {
  const context = useLanguage();
  const { translations, language } = context;

  // Create t function that explicitly depends on both language and translations
  const t = React.useCallback((key: string, fallback?: string) => {
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    return typeof value === "string" ? value : fallback || key;
  }, [language, translations]); // Explicit dependency on language and translations

  return { t, language };
};
