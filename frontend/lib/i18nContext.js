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
   * Translate a product name to the active language.
   *
   * Accepts either:
   *   - A product/variant object with { name, nameRu, nameEn } fields (new API)
   *   - A plain string (legacy — e.g., order-history items stored before this migration)
   *     In that case the Romanian name is returned as-is for 'ro', and for other
   *     languages the old static dictionary is used as a best-effort fallback.
   */
  function translateProductName(productOrName) {
    if (!productOrName) return productOrName

    if (typeof productOrName === 'object') {
      if (lang === 'ru' && productOrName.nameRu) return productOrName.nameRu
      if (lang === 'en' && productOrName.nameEn) return productOrName.nameEn
      return productOrName.name ?? ''
    }

    // Legacy string path — best-effort dictionary lookup
    if (lang === 'ro') return productOrName
    const dict = translations[lang] ?? translations[DEFAULT]
    return dict.productNames?.[productOrName] ?? productOrName
  }

  /**
   * Translate a category name to the active language.
   *
   * Accepts either:
   *   - A category object with { name, nameRu, nameEn } fields (new API)
   *   - A plain string (legacy fallback)
   */
  function translateCategoryName(categoryOrName) {
    if (!categoryOrName) return categoryOrName

    if (typeof categoryOrName === 'object') {
      if (lang === 'ru' && categoryOrName.nameRu) return categoryOrName.nameRu
      if (lang === 'en' && categoryOrName.nameEn) return categoryOrName.nameEn
      return categoryOrName.name ?? ''
    }

    // Legacy string path — best-effort dictionary lookup
    if (lang === 'ro') return categoryOrName
    const dict = translations[lang] ?? translations[DEFAULT]
    return dict.categoryNames?.[categoryOrName] ?? categoryOrName
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
