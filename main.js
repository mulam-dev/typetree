import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let main_window;

function create_window() {
  main_window = new BrowserWindow({
    width: 100,
    height: 100,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    resizable: false,
    autoHideMenuBar: true,
    show: false,
  });

  // main_window.loadFile('index.html');
  main_window.loadURL('http://localhost:5500');

  main_window.webContents.once('did-finish-load', () => {
    if (process.argv.length > 1) {
      const file_path = process.argv.pop();
      if (file_path) {
        const absolute_file_path = path.resolve(file_path);
        fs.readFile(absolute_file_path, 'utf-8', (err, data) => {
          if (err) {
            console.error('File read error:', err);
          } else {
            main_window.webContents.send('file_opened', { file_path: absolute_file_path, data });
          }
        });
      }
    }
  });

  main_window.setMenuBarVisibility(false);
}

app.once('ready', create_window);

ipcMain.handle('show_window', async (event, center = false) => {
  if (center)
    main_window.center();
  main_window.show();
});

ipcMain.handle('save_file', async (event, { file_path, data }) => {
  fs.writeFileSync(file_path, data);
});

ipcMain.handle('save_file_as', async (event, { file_path, data }) => {
  const { canceled, filePath: save_path } = await dialog.showSaveDialog(main_window, {
    defaultPath: file_path
  });
  if (!canceled && save_path) {
    fs.writeFileSync(save_path, data);
    return save_path;
  }
  return null;
});

ipcMain.handle('open_file_dialog', async (event, current_file_path) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(main_window, {
    defaultPath: dirname(current_file_path),
    properties: ['openFile']
  });
  if (!canceled && filePaths.length > 0) {
    const file_path = filePaths[0];
    const data = fs.readFileSync(file_path, 'utf-8');
    return { file_path, data };
  }
  return null;
});
