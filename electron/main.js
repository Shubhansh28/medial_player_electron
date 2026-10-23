const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs/promises');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { config } = require('dotenv')
config()

let mainWindow;

function getProgressPath() {
  return path.join(app.getPath('userData'), 'progress.json');
}

async function readProgress() {
  try {
    const data = JSON.parse(await fs.readFile(getProgressPath(), 'utf8'));

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => Number.isFinite(value) && value >= 0),
    );
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return {};
    }

    throw error;
  }
}

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

  if (process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
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

ipcMain.handle('media:file-url', (_event, filePath) => {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('A valid media path is required.');
  }

  return pathToFileURL(filePath).href;
});

ipcMain.handle('progress:load', async (_event, filePath) => {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('A valid media path is required.');
  }

  const progress = await readProgress();
  return progress[filePath] || 0;
});

ipcMain.handle('progress:save', async (_event, filePath, seconds) => {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('A valid media path is required.');
  }

  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new Error('A valid playback position is required.');
  }

  const progress = await readProgress();
  progress[filePath] = seconds;
  await fs.mkdir(app.getPath('userData'), { recursive: true });
  await fs.writeFile(getProgressPath(), JSON.stringify(progress, null, 2), 'utf8');
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
