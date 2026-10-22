import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { locales } from '../src/locale.mjs';

const roots = ['web', '.github'];
const files = ['.gitignore', '.gitattributes', 'package.json', 'package-lock.json', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'README.md'];
const textFile = name => /\.(?:mjs|cjs|js|css|svg|html|json|md|txt|yml|yaml)$/.test(name) || ['LICENSE', '.gitignore', '.gitattributes'].includes(name);
const allowed = name => (!name.endsWith('.md') || files.includes(name)) && (files.includes(name) || roots.some(root => name.startsWith(root + '/')) && name !== 'web/scripts/preview.cjs' && !/^web\/src\/images\/icon-\d+\.png$/.test(name));
const rules = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['GitHub credential', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
  ['cloud credential', /\bAKIA[A-Z0-9]{16}\b/],
  ['embedded password', /\b(?:password|passwd|passwort|api[_-]?key|access[_-]?token)\s*[:=]\s*['"][^'"\s]{8,}['"]/i],
  ['credential in URL', /https?:\/\/[^\s/@:]+:[^\s/@]+@/i],
  ['obsolete host', /\b[a-z0-9-]+\.ddns\.net\b/i],
  ['private workstation path', /\b[A-Z]:[\\/](?:Users|JUGGERMASTER)[\\/]/i]
];
function inspect(name, data) {
  if (!textFile(name)) return;
  const text = data.toString('utf8');
  for (const [reason, pattern] of rules) assert.ok(!pattern.test(text), `${name}: ${reason}`);
  if (name.endsWith('.svg')) assert.doesNotMatch(text, /<script\b|<foreignObject\b|(?:href|src)\s*=\s*['"](?:https?:|\/\/|data:)/i, `${name}: external or executable SVG content`);
}
async function walk(folder) {
  const result = [];
  for (const item of await readdir(folder, { withFileTypes: true })) {
    const name = `${folder}/${item.name}`;
    if (item.isDirectory()) result.push(...await walk(name)); else if (item.isFile()) result.push(name);
  }
  return result;
}
function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  assert.equal(result.status, 0, `Git inspection failed: ${args[0]}`);
  return result.stdout;
}
const mode = process.argv[2];
if (mode === 'source') {
  let count = 0;
  for (const name of [...files, ...(await Promise.all(roots.map(walk))).flat()].filter(allowed)) {
    inspect(name, await readFile(name)); count++;
  }
  console.log(`OK: ${count} public source files checked for credentials, obsolete hosts and private paths.`);
} else if (mode === 'history') {
  const revision = process.argv[3] || 'HEAD';
  assert.match(revision, /^(?:HEAD|[a-f0-9]{7,40})$/);
  const commits = git(['rev-list', revision]).trim().split('\n');
  let count = 0;
  for (const commit of commits) {
    for (const name of git(['ls-tree', '-r', '-z', '--name-only', commit]).split('\0').filter(Boolean)) {
      assert.ok(allowed(name), `${name}: not part of the public project`);
      inspect(name, Buffer.from(git(['show', `${commit}:${name}`]))); count++;
    }
  }
  console.log(`OK: ${commits.length} commits and ${count} committed file versions checked; HEAD ${git(['rev-parse', revision]).trim()}.`);
} else if (mode === 'build') {
  const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
  assert.equal(manifest.name, 'JUGGERMASTER'); assert.equal(manifest.short_name, 'JUGGERMASTER');
  assert.equal(manifest.scope, './'); assert.equal(manifest.start_url, './');
  for (const size of [180, 192, 512]) {
    const name = size === 180 ? manifest.icons[0].src.replace('192.png', '180.png') : manifest.icons.find(icon => icon.sizes === `${size}x${size}`).src;
    const png = await readFile('dist/' + name.replace(/^\.\//, ''));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), size); assert.equal(png.readUInt32BE(20), size);
  }
  for (const page of ['hilfe', 'impressum', 'datenschutz', 'lizenzen']) {
    const html = await readFile(`dist/${page}.html`, 'utf8');
    assert.doesNotMatch(html, /jm-statusbar/, `${page}: no status bar overlay`);
    for (const language of Object.keys(locales)) assert.ok(html.includes(`data-locale="${language}"`), `${page}/${language}`);
    assert.ok(html.includes('Content-Security-Policy'), page);
  }
  const worker = await readFile('dist/sw.js', 'utf8');
  const entry = await readFile('dist/index.html', 'utf8');
  assert.doesNotMatch(entry, /apple-mobile-web-app-status-bar-style/);
  assert.doesNotMatch(entry, /jm-statusbar/);
  const cached = JSON.parse(/const FILES = (\[.*\]);/.exec(worker)[1]);
  for (const file of cached) {
    assert.ok(!file.url.includes('..') && !file.url.startsWith('/'));
    const data = await readFile('dist/' + file.url);
    assert.equal('sha256-' + createHash('sha256').update(data).digest('base64'), file.integrity, file.url);
    inspect(file.url, data);
    if (textFile(file.url)) assert.doesNotMatch(data.toString(), /__(?:ASSETS|VERSION|BUILD|FILES|LANGUAGE_OPTIONS|BODY_DE|BODY_EN|EXTRA_LOCALES)__/, file.url);
  }
  assert.ok(cached.some(file => file.url === 'LICENSE.txt'));
  assert.ok(cached.some(file => file.url === 'THIRD_PARTY_NOTICES.txt'));
  assert.equal(cached.filter(file => /LICENSE-.*\.txt$/.test(file.url)).length, 7);
  console.log(`OK: generated PNG sizes, 23-language pages, licence files and ${cached.length} offline integrity hashes.`);
} else throw Error('Use source, build or history [commit].');
