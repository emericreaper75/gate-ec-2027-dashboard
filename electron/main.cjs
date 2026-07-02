const { app, BrowserWindow, ipcMain, nativeTheme, protocol, net } = require('electron');
const path = require('path');

let db = null;

function initDatabase() {
  // In production, better-sqlite3 may be in an asar-unpacked location
  const Database = require('better-sqlite3');
  const dbPath = path.join(app.getPath('userData'), 'gate_data.sqlite');
  
  db = new Database(dbPath);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  
  // Create the store table if it doesn't exist
  db.exec("CREATE TABLE IF NOT EXISTS store (key TEXT PRIMARY KEY, value TEXT)");
  
  console.log(`Database initialized at: ${dbPath}`);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'GATE EC 2027 Dashboard',
    autoHideMenuBar: true,
    backgroundColor: '#0D0F14',
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // Load from Vite dev server during development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    // Uncomment below to open DevTools automatically in dev mode
    // mainWindow.webContents.openDevTools();
  } else {
    // Load from built dist file via custom protocol in production
    mainWindow.loadURL('app://-/index.html');
  }

  // Handle window title
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  // Pipe console messages to stdout for debugging
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message}`);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`[Renderer] Failed to load: ${errorDescription} (${errorCode})`);
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error(`[Renderer] Process gone: ${details.reason}`);
  });
}

// Register the app:// protocol as privileged before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true } }
]);

app.whenReady().then(() => {
  // Setup the custom protocol handler
  protocol.handle('app', (request) => {
    let urlPath = request.url.slice('app://-/'.length);
    if (!urlPath || urlPath === '/') urlPath = 'index.html';
    
    const filePath = path.join(__dirname, '../dist', urlPath);
    return net.fetch('file://' + filePath);
  });

  // Initialize the database
  initDatabase();

  // Prepare statements for performance
  const stmtGet = db.prepare("SELECT value FROM store WHERE key = ?");
  const stmtSet = db.prepare("INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)");
  const stmtDel = db.prepare("DELETE FROM store WHERE key = ?");

  ipcMain.handle('store-get', (event, key) => {
    const row = stmtGet.get(key);
    return row ? row.value : null;
  });

  ipcMain.handle('store-set', (event, key, value) => {
    stmtSet.run(key, value);
  });

  ipcMain.handle('store-delete', (event, key) => {
    stmtDel.run(key);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (db) {
    db.close();
  }
});
