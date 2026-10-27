import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const output = join(root, 'dist/screenshots');
const origin = 'http://127.0.0.1:4179/';
const server = spawn(process.execPath, ['web/scripts/serve.mjs'], {
  cwd: root, env: { ...process.env, PORT: '4179' }, windowsHide: true, stdio: ['ignore', 'pipe', 'inherit']
});
let browser;
try {
  await new Promise((resolve, reject) => {
    server.stdout.once('data', resolve);
    server.once('error', reject);
    server.once('exit', code => reject(Error(`Screenshot server exited: ${code}`)));
  });
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  const context = await browser.newContext({ locale: 'en-GB', viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const page = await context.newPage(), errors = [], external = [];
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  context.on('request', request => { if (!request.url().startsWith(origin) && !request.url().startsWith('data:')) external.push(request.url()); });
  await page.goto(origin);
  await page.locator('.jm-app[data-ready=true]').waitFor();
  await page.locator('.jm-offline').waitFor({ state: 'hidden', timeout: 60000 });
  await mkdir(output, { recursive: true });
  const sums = [];
  for (const [name, view, width, height] of [
    ['match', 'match', 390, 844],
    ['setup', 'setup', 390, 844],
    ['sound', 'sound', 390, 844],
    ['desktop', 'setup', 1440, 900]
  ]) {
    await page.setViewportSize({ width, height });
    await page.locator(`[data-tab=${view}]`).click();
    await page.locator(`[data-view=${view}]`).waitFor({ state: 'visible' });
    await page.locator('.jm-scroll').evaluate(element => { element.scrollTop = 0; });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: horizontal overflow`);
    const image = await page.screenshot({ path: join(output, `${name}.png`), animations: 'disabled' });
    assert.equal(image.subarray(1, 4).toString(), 'PNG', name);
    assert.equal(image.readUInt32BE(16), width, name);
    assert.equal(image.readUInt32BE(20), height, name);
    sums.push(`${createHash('sha256').update(image).digest('hex')}  screenshots/${name}.png`);
  }
  assert.deepEqual(errors, [], 'Screenshots must show a working app');
  assert.deepEqual(external, [], 'Screenshots use only local app assets');
  const previous = (await readFile(join(root, 'dist/SHA256SUMS'), 'utf8')).trim().split('\n').filter(line => !line.includes('  screenshots/'));
  await writeFile(join(root, 'dist/SHA256SUMS'), [...previous, ...sums].join('\n') + '\n');
  console.log('OK: four current README screenshots, mobile/desktop layouts, PNG sizes and checksums.');
} finally {
  await browser?.close();
  server.kill();
}
