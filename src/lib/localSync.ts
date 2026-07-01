import { get, set } from 'idb-keyval';

export let syncDirHandle: any = null;

export async function requestSyncDirectory() {
  try {
    if (!('showDirectoryPicker' in window)) {
      throw new Error("File System Access API is not supported in this browser.");
    }
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite'
    });
    await set('sync_dir_handle', dirHandle);
    syncDirHandle = dirHandle;
    return dirHandle;
  } catch (error) {
    console.error("Directory selection failed", error);
    throw error;
  }
}

export async function loadSyncDirectoryHandle() {
  try {
    const dirHandle = await get('sync_dir_handle');
    if (dirHandle) {
      syncDirHandle = dirHandle;
      return dirHandle;
    }
    return null;
  } catch (e) {
    console.error("Failed to load directory handle from IDB", e);
    return null;
  }
}

export async function requestDirectoryPermission() {
  if (!syncDirHandle) return false;
  try {
    const options = { mode: 'readwrite' as const };
    if ((await syncDirHandle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await syncDirHandle.requestPermission(options)) === 'granted') {
      return true;
    }
    return false;
  } catch (e) {
    console.error("Permission request failed", e);
    return false;
  }
}

export async function writeStateToDir(state: any) {
  if (!syncDirHandle) return;
  try {
    if ((await syncDirHandle.queryPermission({ mode: 'readwrite' })) !== 'granted') {
      return;
    }

    const collections = [
      'tasks', 'pyqLogs', 'mocks', 'formulas', 'errors', 
      'weeklyReviews', 'mastery', 'priorityBoard', 'reminders', 
      'milestones', 'notes', 'settings'
    ];

    for (const key of collections) {
      if (state[key] !== undefined) {
        const fileHandle = await syncDirHandle.getFileHandle(`${key}.json`, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(state[key], null, 2));
        await writable.close();
      }
    }
  } catch(e) {
    console.error("Local sync write failed", e);
  }
}

export async function readStateFromDir() {
  if (!syncDirHandle) return null;
  try {
    if ((await syncDirHandle.queryPermission({ mode: 'readwrite' })) !== 'granted') {
      return null;
    }

    const state: any = {};
    const collections = [
      'tasks', 'pyqLogs', 'mocks', 'formulas', 'errors', 
      'weeklyReviews', 'mastery', 'priorityBoard', 'reminders', 
      'milestones', 'notes', 'settings'
    ];

    for (const key of collections) {
      try {
        const fileHandle = await syncDirHandle.getFileHandle(`${key}.json`);
        const file = await fileHandle.getFile();
        const text = await file.text();
        state[key] = JSON.parse(text);
      } catch (e) {
        // File might not exist yet or JSON might be invalid, skip
      }
    }
    return Object.keys(state).length > 0 ? state : null;
  } catch(e) {
    console.error("Local sync read failed", e);
    return null;
  }
}
