import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { pages } from '../info-content.mjs';
import { locales } from '../src/locale.mjs';
import sharp from 'sharp';

const languageOptions = () => Object.entries(locales).map(([code, locale]) => `<button role="option" data-language-option="${code}" aria-label="${locale.name}" aria-selected="false"><img class="jm-flag" data-language="${code}" src="__ASSETS__/images/flag-${locale.flag}.svg" alt="" aria-hidden="true"></button>`).join('');

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const dist = join(root, 'dist'), src = join(root, 'web/src');
const version = process.env.JUGGER_RELEASE || 'v41';
if (!/^v[1-9]\d*(?:[.-][a-z0-9]+)*$/.test(version)) throw Error('Ungültige Versionsnummer.');
if (resolve(dist) !== resolve(root, 'dist') || relative(root, dist) !== 'dist') throw Error('Ungültiges Build-Ziel.');
const names = (await list(src)).map(path => relative(src, path).replaceAll('\\', '/')).filter(name => name !== 'service-worker.js' && !/^images\/icon-\d+\.png$/.test(name));
const sources = await Promise.all(names.sort().map(async name => [name, await readFile(join(src, name))]));
const vendorNames = await readdir(join(root, 'web/vendor'));
const vendor = await Promise.all(vendorNames.sort().map(async name => [name, await readFile(join(root, 'web/vendor', name))]));
const projectLicense = await readFile(join(root, 'LICENSE'));
const notices = await readFile(join(root, 'THIRD_PARTY_NOTICES.md'));
const icons = await Promise.all([180, 192, 512].map(async size => [`images/icon-${size}.png`, await sharp(join(src, 'images/icon.svg')).resize(size, size).png().toBuffer()]));
const digest = createHash('sha256');
for (const [name, value] of [...sources, ...vendor, ...icons]) digest.update(name).update(value);
digest.update('LICENSE').update(projectLicense);
digest.update('THIRD_PARTY_NOTICES').update(notices);
digest.update(await readFile(fileURLToPath(import.meta.url)));
digest.update(await readFile(join(src, 'service-worker.js')));
digest.update(JSON.stringify(pages)).update(await readFile(join(root, 'web/info-template.html')));
const build = `${version}-${digest.digest('hex').slice(0, 12)}`;
const assetPath = `releases/${build}/assets`;
await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, assetPath, 'images'), { recursive: true });
await writeFile(join(dist, 'LICENSE.txt'), projectLicense);
await writeFile(join(dist, 'THIRD_PARTY_NOTICES.txt'), notices);
for (const [name, value] of icons) await writeFile(join(dist, assetPath, name), value);
for (const [name, value] of [...sources.filter(([name]) => !name.endsWith('.html')), ...vendor]) {
  const text = /\.(?:mjs|css|js|svg|txt)$/.test(name) ? value.toString().replaceAll('__VERSION__', version).replaceAll('__BUILD__', build) : value;
  await writeFile(join(dist, assetPath, name), text);
}
for (const [name, value] of sources.filter(([name]) => name.endsWith('.html'))) {
  const html = value.toString().replaceAll('__LANGUAGE_OPTIONS__', languageOptions()).replaceAll('__ASSETS__', `./${assetPath}`).replaceAll('__VERSION__', version);
  if (/window\.openai|\bTweak\b|<script[^>]+src="https?:/i.test(html)) throw Error('Unerwartete externe Vorschau-Abhängigkeit.');
  await writeFile(join(dist, name), html);
}
const template = await readFile(join(root, 'web/info-template.html'), 'utf8');
for (const [name, page] of Object.entries(pages)) {
  const extra = Object.entries(page.locales || {}).map(([language, content]) => `<section data-locale="${language}" lang="${language}" dir="${content.dir}" hidden>${content.body}</section>`).join('');
  const html = template.replaceAll('__LANGUAGE_OPTIONS__', languageOptions()).replaceAll('__TITLE_DE__', page.title.de).replaceAll('__TITLE_EN__', page.title.en).replace('__BODY_DE__', page.de).replace('__BODY_EN__', page.en).replace('__EXTRA_LOCALES__', extra).replaceAll('__ASSETS__', `./${assetPath}`);
  await writeFile(join(dist, `${name}.html`), html);
}
await writeFile(join(dist, 'manifest.webmanifest'), JSON.stringify({
  id: './', name: 'JUGGERMASTER', short_name: 'JUGGERMASTER', description: 'Open Source Jugger Game Assistant – Jugger-Taktgeber, Punkte und Spielzeit. Offline im Browser.',
  lang: 'de', start_url: './', scope: './', display: 'standalone', background_color: '#181d1a', theme_color: '#181d1a',
  icons: [{ src: `./${assetPath}/images/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' }, { src: `./${assetPath}/images/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }]
}, null, 2) + '\n');
async function list(folder) {
  const result = [];
  for (const item of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, item.name);
    if (item.isDirectory()) result.push(...await list(path)); else result.push(path);
  }
  return result;
}
const files = [];
for (const path of await list(dist)) files.push({ url: relative(dist, path).replaceAll('\\', '/'), integrity: `sha256-${createHash('sha256').update(await readFile(path)).digest('base64')}` });
const worker = (await readFile(join(src, 'service-worker.js'), 'utf8')).replaceAll('__BUILD__', build).replace('__FILES__', JSON.stringify(files));
await writeFile(join(dist, 'sw.js'), worker);
const sums = [];
for (const path of await list(dist)) sums.push(`${createHash('sha256').update(await readFile(path)).digest('hex')}  ${relative(dist, path).replaceAll('\\', '/')}`);
await writeFile(join(dist, 'SHA256SUMS'), sums.join('\n') + '\n');
console.log(`${version}: ${files.length} Offline-Dateien, Build ${build}. Ausgabe: ${dist}`);
