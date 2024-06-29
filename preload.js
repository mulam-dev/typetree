const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('native', {
  show_window: (center = false) => ipcRenderer.invoke('show_window', center),
  save_file: (file_path, data) => ipcRenderer.invoke('save_file', { file_path, data }),
  save_file_as: (file_path, data) => ipcRenderer.invoke('save_file_as', { file_path, data }),
  open_file_dialog: (current_file_path) => ipcRenderer.invoke('open_file_dialog', current_file_path),
  on_file_opened: (callback) => ipcRenderer.on('file_opened', (event, file) => callback(file))
});
