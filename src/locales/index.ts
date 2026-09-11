import en from './en'
import zh from './zh'

export const locales = {
  en,
  zh
} as const

export type LocaleKey = keyof typeof locales
