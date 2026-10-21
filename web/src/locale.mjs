export const locales = {
  de: { name: 'Deutsch', flag: 'de', tag: 'de-DE' },
  en: { name: 'English', flag: 'gb', tag: 'en-GB' },
  es: { name: 'Español', flag: 'es', tag: 'es-ES' },
  fr: { name: 'Français', flag: 'fr', tag: 'fr-FR' },
  it: { name: 'Italiano', flag: 'it', tag: 'it-IT' },
  pt: { name: 'Português', flag: 'pt', tag: 'pt-PT' },
  nl: { name: 'Nederlands', flag: 'nl', tag: 'nl-NL' },
  da: { name: 'Dansk', flag: 'dk', tag: 'da-DK' },
  sv: { name: 'Svenska', flag: 'se', tag: 'sv-SE' },
  fi: { name: 'Suomi', flag: 'fi', tag: 'fi-FI' },
  pl: { name: 'Polski', flag: 'pl', tag: 'pl-PL' },
  cs: { name: 'Čeština', flag: 'cz', tag: 'cs-CZ' },
  hu: { name: 'Magyar', flag: 'hu', tag: 'hu-HU' },
  ro: { name: 'Română', flag: 'ro', tag: 'ro-RO' },
  lv: { name: 'Latviešu', flag: 'lv', tag: 'lv-LV' },
  lt: { name: 'Lietuvių', flag: 'lt', tag: 'lt-LT' },
  ru: { name: 'Русский', flag: 'ru', tag: 'ru-RU' },
  uk: { name: 'Українська', flag: 'ua', tag: 'uk-UA' },
  he: { name: 'עברית', flag: 'il', tag: 'he-IL', dir: 'rtl' },
  ja: { name: '日本語', flag: 'jp', tag: 'ja-JP' },
  ko: { name: '한국어', flag: 'kr', tag: 'ko-KR' },
  'zh-Hans': { name: '简体中文', flag: 'cn', tag: 'zh-CN' },
  'zh-Hant': { name: '繁體中文', flag: 'tw', tag: 'zh-TW' }
};

export function resolveLanguage(preferences = [], saved) {
  if (Object.hasOwn(locales, saved)) return saved;
  for (const value of preferences) {
    if (typeof value !== 'string') continue;
    const tag = value.toLowerCase().replaceAll('_', '-'), base = tag.split('-')[0];
    if (base === 'zh') return /(?:^|-)hans(?:-|$)/.test(tag) ? 'zh-Hans' : /(?:^|-)(?:hant|tw|hk|mo)(?:-|$)/.test(tag) ? 'zh-Hant' : 'zh-Hans';
    if (base === 'iw') return 'he';
    if (Object.hasOwn(locales, base)) return base;
  }
  return 'de';
}

export function moveLanguageFocus(options, key, active) {
  const index = options.indexOf(active), last = options.length - 1;
  options[key === 'Home' ? 0 : key === 'End' ? last : (Math.max(0, index) + (key === 'ArrowUp' ? -1 : 1) + options.length) % options.length]?.focus();
}
