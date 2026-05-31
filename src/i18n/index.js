import en from './en';
import nl from './nl';
import es from './es';
import de from './de';
import ar from './ar';

export const supportedLanguages = [
  { id: 'en', label: 'English', dir: 'ltr' },
  { id: 'nl', label: 'Dutch', dir: 'ltr' },
  { id: 'es', label: 'Spanish', dir: 'ltr' },
  { id: 'de', label: 'German', dir: 'ltr' },
  { id: 'ar', label: 'Arabic (experimental)', dir: 'rtl', experimental: true },
];

export const dictionaries = { en, nl, es, de, ar };

export function normalizeLanguage(value) {
  return supportedLanguages.some((item) => item.id === value) ? value : 'en';
}

export function translate(lang, key, fallback = key) {
  const code = normalizeLanguage(lang);
  return dictionaries[code]?.[key] || dictionaries.en[key] || fallback;
}

export function getLanguageMeta(lang) {
  return supportedLanguages.find((item) => item.id === normalizeLanguage(lang)) || supportedLanguages[0];
}
