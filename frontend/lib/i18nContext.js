import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from './translations'

const SUPPORTED = ['ro', 'ru', 'en']
const DEFAULT = 'ro'
const STORAGE_KEY = 'app_language'

const I18nContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT)

  // Hydrate from localStorage only on client
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED.includes(saved)) {
      setLang(saved)
    }
  }, [])

  function changeLanguage(newLang) {
    if (!SUPPORTED.includes(newLang)) return
    setLang(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)
  }

  /** Translate a key, substituting {varName} placeholders */
  function t(key, vars = {}) {
    const dict = translations[lang] ?? translations[DEFAULT]
    let str = dict[key] ?? translations[DEFAULT][key] ?? key
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    })
    return str
  }

  /**
   * Translate a product name stored in Romanian (from DB) to the active language.
   * Falls back to the original name when no translation is found.
   */
  function translateProductName(name) {
    if (!name) return name
    const dict = translations[lang] ?? translations[DEFAULT]
    return dict.productNames?.[name] ?? name
  }

  /**
   * Translate a category name stored in Romanian (from DB) to the active language.
   * Falls back to the original name when no translation is found.
   */
  function translateCategoryName(name) {
    if (!name) return name
    const dict = translations[lang] ?? translations[DEFAULT]
    return dict.categoryNames?.[name] ?? name
  }

  return (
    <I18nContext.Provider value={{ lang, changeLanguage, t, translateProductName, translateCategoryName }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
