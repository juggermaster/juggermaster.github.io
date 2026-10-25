export async function audioFile(target, operation = 'get', file) {
  // WebKit cannot persist Blob/File objects in private browser sessions.
  if (operation === 'put') file = { bytes: new Uint8Array(await file.file.arrayBuffer()), name: file.file.name, type: file.file.type, lastModified: file.file.lastModified, duration: file.duration };
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open('juggermaster:audio:v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(Error('Audio storage blocked'));
  });
  try {
    const saved = await new Promise((resolve, reject) => {
      const transaction = database.transaction('files', operation === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('files');
      const request = operation === 'put' ? store.put(file, target) : operation === 'delete' ? store.delete(target) : store.get(target);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error || Error('Audio storage failed'));
      transaction.onerror = () => reject(transaction.error);
    });
    return operation === 'get' && saved?.bytes ? { file: new File([saved.bytes], saved.name, { type: saved.type, lastModified: saved.lastModified }), duration: saved.duration } : saved;
  } finally { database.close(); }
}
