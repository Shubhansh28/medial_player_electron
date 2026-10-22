const path = require('node:path');
const fs = require('node:fs/promises');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#f4f7fb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.handle('app:ping', () => 'pong');

ipcMain.handle('folder:select', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Choose a study folder',
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('folder:scan', async (_event, folderPath) => {
  if (typeof folderPath !== 'string' || folderPath.trim() === '') {
    throw new Error('A valid folder path is required.');
  }

  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const supportedExtensions = new Set(['.mp4', '.webm']);

  return entries
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => ({
      name: entry.name,
      path: path.join(folderPath, entry.name),
    }))
    .sort((first, second) => first.name.localeCompare(second.name));
});

app.whenReady().then(() => {
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
