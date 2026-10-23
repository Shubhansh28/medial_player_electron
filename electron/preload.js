const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('app:ping'),
  selectFolder: () => ipcRenderer.invoke('folder:select'),
  scanFolder: (folderPath) => ipcRenderer.invoke('folder:scan', folderPath),
  getMediaUrl: (filePath) => ipcRenderer.invoke('media:file-url', filePath),
  loadProgress: (filePath) => ipcRenderer.invoke('progress:load', filePath),
  saveProgress: (filePath, seconds) => ipcRenderer.invoke('progress:save', filePath, seconds),
  loadHistory: () => ipcRenderer.invoke('history:load'),
  renameFile: (filePath, newName) => ipcRenderer.invoke('file:rename', filePath, newName),
  deleteFile: (filePath) => ipcRenderer.invoke('file:delete', filePath),
  showInFolder: (filePath) => ipcRenderer.invoke('file:show-in-folder', filePath),
});
