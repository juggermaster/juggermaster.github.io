import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('Cache cleanup preserves other open games and unrelated caches', async () => {
  const source = (await readFile(new URL('../src/service-worker.js', import.meta.url), 'utf8')).replaceAll('__BUILD__', 'v6-current').replace('__FILES__', '[]');
  const names = new Set(['juggermaster-v6-current', 'juggermaster-v5-old', 'another-app']);
  const handlers = new Map();
  let windows = [{ id: 'current' }, { id: 'old-game' }], reply;
  const cache = { match: async url => String(url).endsWith('.offline-complete') ? { json: async () => ['http://localhost/index.html'] } : true };
  vm.runInNewContext(source, {
    URL, Response, Request,
    self: { location: { href: 'http://localhost/sw.js' }, addEventListener: (name, handler) => handlers.set(name, handler), clients: { matchAll: async () => windows } },
    caches: { keys: async () => [...names], open: async () => cache, delete: async name => names.delete(name) }
  });
  const check = async build => {
    let pending;
    handlers.get('message')({ data: { type: 'CHECK_OFFLINE', build }, source: { id: 'current' }, ports: [{ postMessage: value => { reply = value; } }], waitUntil: promise => { pending = promise; } });
    await pending;
    assert.equal(reply, true);
  };
  await check('v6-current');
  assert.ok(names.has('juggermaster-v5-old'), 'An open older game retains its files');
  windows = [{ id: 'current' }];
  await check('v5-old');
  assert.ok(names.has('juggermaster-v5-old'), 'An older client cannot trigger cleanup');
  await check('v6-current');
  assert.deepEqual([...names].sort(), ['another-app', 'juggermaster-v6-current']);
});
