import { app, BrowserWindow, ipcMain, dialog } from "electron";
import fs from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WINDOW_MIN_WIDTH = 500;
const WINDOW_MIN_HEIGHT = 200;

const App = new (class {
  window = null;

  init() {
    this.window = new BrowserWindow({
      width: 700,
      height: 500,
      minWidth: WINDOW_MIN_WIDTH,
      minHeight: WINDOW_MIN_HEIGHT,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
      autoHideMenuBar: true,
      // show: false,
      frame: false,
    });
    this.window.loadFile(join(__dirname, "app.html"));
    // this.window.loadURL("http://127.0.0.1:5500/src/app.html");
    this.window.setMenuBarVisibility(false);

    ipcMain.handle("show_window", () => this.window.show());
    ipcMain.handle("minimize_window", () => this.window.minimize());
    ipcMain.handle("toggle_maximize_window", () =>
      this.window.isMaximized()
        ? this.window.unmaximize()
        : this.window.maximize(),
    );
    ipcMain.handle("resize_window_by", (_, dw, dh, initial = false) => {
      if (this.window.isMaximized()) return;
      const { x: px, y: py, width: pw, height: ph } = this.window.getBounds();
      dw = Math.max(dw, WINDOW_MIN_WIDTH - pw);
      if (initial) {
        this.window.setBounds(
          { x: px - dw / 2, y: py - dh / 2, width: pw + dw, height: ph + dh },
          false,
        );
      } else {
        this.window.setBounds(
          { x: px - dw, width: pw + dw, height: ph + dh },
          true,
        );
      }
    });
    ipcMain.handle("exit", () => app.exit());

    ipcMain.handle("click", ({ sender }, opts) => {
      sender.sendInputEvent({ type: "mouseDown", ...opts });
      sender.sendInputEvent({ type: "mouseUp", ...opts });
    });

    ipcMain.handle("get_arg", () => {
      const argv = [...process.argv];
      if (!app.isPackaged) argv.shift();
      const finish = (path) => (path ? resolve(path) : (path ?? null));
      return finish(argv[1]);
    });
    ipcMain.handle("open_file", async (_, file_path) => {
      const data = fs.readFileSync(file_path, "utf-8");
      return { file_path, data };
    });
    ipcMain.handle("open_file_dialog", async (_, current_file_path) => {
      const { canceled, filePaths } = await dialog.showOpenDialog(this.window, {
        defaultPath: current_file_path ? dirname(current_file_path) : undefined,
        properties: ["openFile"],
      });
      if (!canceled && filePaths.length > 0) {
        const file_path = filePaths[0];
        const data = fs.readFileSync(file_path, "utf-8");
        return { file_path, data };
      }
      return null;
    });
    ipcMain.handle("save_file", async (_, file_path, data) => {
      fs.writeFileSync(file_path, data);
    });
    ipcMain.handle("save_file_as", async (_, file_path, data) => {
      const { canceled, filePath: save_path } = await dialog.showSaveDialog(
        this.window,
        {
          defaultPath: file_path ? file_path : undefined,
        },
      );
      if (!canceled && save_path) {
        fs.writeFileSync(save_path, data);
        return save_path;
      }
      return null;
    });
  }
})();

app.once("ready", () => App.init());
