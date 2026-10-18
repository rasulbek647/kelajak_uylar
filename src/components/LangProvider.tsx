"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dict, Lang } from '@/lib/lang';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof dict['uz'];
  customTranslations: Record<string, Record<string, string>>;
  setCustomTranslations: (data: Record<string, Record<string, string>>) => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'uz',
  setLang: () => {},
  t: dict['uz'],
  customTranslations: {},
  setCustomTranslations: () => {},
});

export function LangProvider({
  children,
  initialLang = 'uz',
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [customTranslations, setCustomTranslations] = useState<Record<string, Record<string, string>>>({});

  // Serverdan kelgan initialLang o'zgarganda (masalan, router.refresh() dan so'ng) sinxronlash
  useEffect(() => {
    if (initialLang && (initialLang === 'uz' || initialLang === 'ru' || initialLang === 'en')) {
      setLangState(initialLang);
    }
  }, [initialLang]);

  useEffect(() => {
    // Cookie o'qish yordamchi funksiyasi
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const cookieLang = getCookie('joymee_lang') || getCookie('lang');
    const localLang = typeof window !== 'undefined' ? (localStorage.getItem('joymee_lang') || localStorage.getItem('lang')) : null;
    const resolved = (cookieLang || localLang) as Lang;

    if (resolved === 'uz' || resolved === 'ru' || resolved === 'en') {
      if (resolved !== lang) {
        setLangState(resolved);
      }
      // Cookie ni har doim yangilab (1 yil muddat bilan) saqlab qo'yamiz
      if (!cookieLang || cookieLang !== resolved) {
        document.cookie = `joymee_lang=${resolved}; path=/; max-age=31536000; SameSite=Lax`;
        document.cookie = `lang=${resolved}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } else {
      // Cookie umuman bo'lmasa, initialLang ni cookie ga yozib qo'yamiz
      document.cookie = `joymee_lang=${initialLang}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `lang=${initialLang}; path=/; max-age=31536000; SameSite=Lax`;
    }

    try {
      const savedCustom = localStorage.getItem('kelajak_custom_translations');
      if (savedCustom) {
        setCustomTranslations(JSON.parse(savedCustom));
      }
      fetch('/api/translations')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && typeof data === 'object') {
            setCustomTranslations(data);
            localStorage.setItem('kelajak_custom_translations', JSON.stringify(data));
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('joymee_lang', l);
      localStorage.setItem('lang', l);
    } catch {}
    if (typeof document !== 'undefined') {
      document.cookie = `joymee_lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
    }
    window.dispatchEvent(new CustomEvent('kelajak_lang_change', { detail: l }));
  };

  // Merge base dict with any custom admin overrides
  const currentDict = {
    ...dict[lang],
    ...(customTranslations[lang] || {}),
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: currentDict as typeof dict['uz'], customTranslations, setCustomTranslations }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export function Translate({ id, defaultText }: { id: keyof typeof dict['uz']; defaultText?: string }) {
  const { t } = useLang();
  return <>{t[id] || defaultText || id}</>;
}
