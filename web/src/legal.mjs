import { translate } from './i18n.mjs';
import { locales, resolveLanguage, moveLanguageFocus } from './locale.mjs';
const $ = selector => document.querySelector(selector), $$ = selector => [...document.querySelectorAll(selector)];
let language = resolveLanguage(navigator.languages || [navigator.language]);
try { language = resolveLanguage(navigator.languages || [navigator.language], localStorage.getItem('juggermaster:language')); } catch {}
function render() {
  document.documentElement.lang = language;
  document.documentElement.dir = locales[language].dir || 'ltr';
  $$('[data-locale]').forEach(section => { section.hidden = section.dataset.locale !== language; });
  $$('[data-i18n]').forEach(element => { element.textContent = translate(language, element.dataset.i18n); });
  $('[data-action=language-menu]').setAttribute('aria-label', translate(language, 'chooseLanguage'));
  $('#jm-languages').setAttribute('aria-label', translate(language, 'chooseLanguage'));
  $('[data-read=language-flag]').dataset.language = language;
  $('[data-read=language-flag]').src = new URL(`./images/flag-${locales[language].flag}.svg`, import.meta.url).href;
  $$('[data-language-option]').forEach(option => option.setAttribute('aria-selected', String(option.dataset.languageOption === language)));
  const key = location.pathname.endsWith('hilfe.html') ? 'help' : location.pathname.endsWith('datenschutz.html') ? 'privacy' : location.pathname.endsWith('lizenzen.html') ? 'licenses' : 'imprint';
  document.title = `${translate(language, key)} · JUGGERMASTER`;
  try { const saved = JSON.parse(localStorage.getItem('juggermaster:state:v1')); if (['light', 'dark'].includes(saved?.theme)) $('.jm-app').style.colorScheme = saved.theme; } catch {}
}
function close(focus = false) { $('#jm-languages').hidden = true; $('[data-action=language-menu]').setAttribute('aria-expanded', 'false'); if (focus) $('[data-action=language-menu]').focus(); }
document.addEventListener('click', event => {
  const option = event.target.closest('[data-language-option]');
  if (option) {
    language = option.dataset.languageOption;
    try {
      localStorage.setItem('juggermaster:language', language);
      const saved = JSON.parse(localStorage.getItem('juggermaster:state:v1'));
      if (saved?.version === 1) { saved.language = language; localStorage.setItem('juggermaster:state:v1', JSON.stringify(saved)); }
    } catch {}
    render(); close(true);
  } else if (event.target.closest('[data-action=language-menu]')) {
    const menu = $('#jm-languages'); menu.hidden = !menu.hidden;
    $('[data-action=language-menu]').setAttribute('aria-expanded', String(!menu.hidden));
    if (!menu.hidden) $(`[data-language-option=${language}]`).focus();
  } else if (!event.target.closest('.jm-language-picker')) close();
});
document.addEventListener('keydown', event => {
  if ($('#jm-languages').hidden) return;
  if (event.key === 'Escape') { event.preventDefault(); close(true); }
  else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); moveLanguageFocus($$('[data-language-option]'), event.key, document.activeElement); }
  else if (event.key === 'Tab') close();
});
render();
