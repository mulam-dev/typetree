import { app, BrowserWindow, ipcMain } from "electron";
import { join, dirname } from "path";
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
            show: false,
            frame: false,
        });
        // this.window.loadFile(join(__dirname, "app.html"));
        this.window.loadURL("http://127.0.0.1:5500/src/app.html");
        this.window.setMenuBarVisibility(false);

        ipcMain.handle("get_arg", () => {
            const argv = process.argv;
            if (argv[1] === '.') {
                return argv[2] ?? null;
            } else {
                return argv[1] ?? null;
            }
        });
        ipcMain.handle("show_window", () => this.window.show());
        ipcMain.handle("minimize_window", () => this.window.minimize());
        ipcMain.handle("toggle_maximize_window", () => this.window.isMaximized() ? this.window.unmaximize() : this.window.maximize());
        ipcMain.handle("resize_window_by", (_, dw, dh, initial = false) => {
            if (this.window.isMaximized()) return;
            const {x: px, y: py, width: pw, height: ph} = this.window.getBounds();
            dw = Math.max(dw, WINDOW_MIN_WIDTH - pw);
            if (initial) {
                this.window.setBounds({x: px - dw / 2, y: py - dh / 2, width: pw + dw, height: ph + dh}, false);
            } else {
                this.window.setBounds({x: px - dw, width: pw + dw, height: ph + dh}, true);
            }
        });
        ipcMain.handle("exit", () => app.exit());
    }
})();

app.once("ready", () => App.init());
