import { createContext } from 'react'
import { locales } from '../../locales'

export type Language = keyof typeof locales

export type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)
