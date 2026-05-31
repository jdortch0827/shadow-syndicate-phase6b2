import { translate, normalizeLanguage, getLanguageMeta } from '../i18n';

export function getLanguage(settings = {}) {
  return normalizeLanguage(settings.language || 'en');
}

export function makeTranslator(settings = {}) {
  const lang = getLanguage(settings);
  return (key, fallback = key) => translate(lang, key, fallback);
}

export function getDirectionForLanguage(lang) {
  return getLanguageMeta(lang).dir || 'ltr';
}
