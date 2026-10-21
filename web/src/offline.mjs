export const offlineState = { status: 'loading', waiting: null };
const build = '__BUILD__';
let registration, busy = false, reloading = false;
function message(worker, type) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => { channel.port1.close(); reject(Error('Offline timeout')); }, 12000);
    channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
    worker.postMessage({ type, build }, [channel.port2]);
  });
}
function ready(registration) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Registration timeout')), 30000);
    const done = value => { clearTimeout(timer); resolve(value); };
    const failed = () => { clearTimeout(timer); reject(Error('Offline installation failed')); };
    navigator.serviceWorker.ready.then(done, failed);
    const worker = registration.installing;
    if (worker?.state === 'redundant') failed();
    else worker?.addEventListener('statechange', () => { if (worker.state === 'redundant') failed(); });
  });
}
export async function setupOffline(changed) {
  if (busy) return;
  if (!isSecureContext || !('serviceWorker' in navigator)) { offlineState.status = 'unsupported'; changed(); return; }
  busy = true;
  try {
    registration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
    const waiting = () => { offlineState.waiting = registration.waiting; changed(); };
    if (!registration.__listening) {
      registration.__listening = true;
      registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed') waiting(); }); });
    }
    waiting();
    const active = await ready(registration);
    const result = await message(active.active, 'CHECK_OFFLINE');
    offlineState.status = result === true ? 'ready' : 'error';
    if (result !== true && navigator.onLine) {
      offlineState.status = await message(active.active, 'REPAIR_OFFLINE') === true ? 'ready' : 'error';
    }
    waiting();
  } catch { offlineState.status = 'error'; }
  finally { busy = false; changed(); }
}
export async function applyUpdate() {
  if (!registration?.waiting) return false;
  reloading = true;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading) location.reload(); }, { once: true });
  registration.waiting.postMessage({ type: 'ACTIVATE' });
  return true;
}
