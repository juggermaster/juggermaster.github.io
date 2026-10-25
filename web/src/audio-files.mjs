export async function audioFile(target, operation = 'get', file) {
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open('juggermaster:audio:v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(Error('Audio storage blocked'));
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('files', operation === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('files');
      const request = operation === 'put' ? store.put(file, target) : operation === 'delete' ? store.delete(target) : store.get(target);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error || Error('Audio storage failed'));
      transaction.onerror = () => reject(transaction.error);
    });
  } finally { database.close(); }
}
