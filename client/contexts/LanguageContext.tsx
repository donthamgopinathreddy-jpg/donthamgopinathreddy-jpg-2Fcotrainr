import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

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
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      const savedLanguage = localStorage.getItem("userLanguage") as LanguageCode | null;
      const defaultLanguage = savedLanguage || "en";

      try {
        await i18n
          .use(LanguageDetector)
          .use(initReactI18next)
          .init({
            resources: await loadTranslations(),
            fallbackLng: "en",
            lng: defaultLanguage,
            interpolation: {
              escapeValue: false,
            },
            detection: {
              order: ["localStorage", "navigator"],
              caches: ["localStorage"],
            },
          });

        setLanguageState(defaultLanguage);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing i18n:", error);
        setIsInitialized(true);
      }
    };

    initI18n();
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("userLanguage", lang);
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: INDIAN_LANGUAGES,
        isInitialized,
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

async function loadTranslations() {
  const translations: Record<string, any> = {};

  // Import all translation files dynamically
  const translationFiles = {
    en: () => import("@/translations/en.json"),
    hi: () => import("@/translations/hi.json"),
    ta: () => import("@/translations/ta.json"),
    te: () => import("@/translations/te.json"),
    kn: () => import("@/translations/kn.json"),
    bn: () => import("@/translations/bn.json"),
    mr: () => import("@/translations/mr.json"),
    gu: () => import("@/translations/gu.json"),
    pa: () => import("@/translations/pa.json"),
    or: () => import("@/translations/or.json"),
    ur: () => import("@/translations/ur.json"),
  };

  for (const [lang, loader] of Object.entries(translationFiles)) {
    try {
      const module = await loader();
      translations[lang] = { translation: module.default };
    } catch (error) {
      console.warn(`Could not load translations for ${lang}:`, error);
    }
  }

  return translations;
}
