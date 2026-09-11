import { useMemo, useState, type ReactNode } from 'react'
import { locales } from '../../locales'
import { LanguageContext, type Language, type LanguageContextValue } from './languageContext'

export type { Language } from './languageContext'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (key: string) => locales[language][key as keyof typeof locales.en] ?? locales.en[key as keyof typeof locales.en] ?? key
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
