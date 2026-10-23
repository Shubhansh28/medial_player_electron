const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('app:ping'),
  selectFolder: () => ipcRenderer.invoke('folder:select'),
  scanFolder: (folderPath) => ipcRenderer.invoke('folder:scan', folderPath),
  getMediaUrl: (filePath) => ipcRenderer.invoke('media:file-url', filePath),
  loadProgress: (filePath) => ipcRenderer.invoke('progress:load', filePath),
  saveProgress: (filePath, seconds) => ipcRenderer.invoke('progress:save', filePath, seconds),
  loadHistory: () => ipcRenderer.invoke('history:load'),
});
