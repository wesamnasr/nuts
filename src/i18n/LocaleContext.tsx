"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { translations, type Locale, type TranslationKey } from "./translations";

type LocaleContextType = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (key: TranslationKey) => string;
  toggleLocale: () => void;
};

// Provide a real Arabic default so SSR components never hit a null context
const defaultValue: LocaleContextType = {
  locale: "ar",
  dir: "rtl",
  t: (key: TranslationKey) => translations["ar"][key] ?? key,
  toggleLocale: () => {},
};

const LocaleContext = createContext<LocaleContextType>(defaultValue);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "ar" ? "en" : "ar"));
  }, []);

  const dir = locale === "ar" ? "rtl" : "ltr";

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] ?? key;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, dir, t, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
