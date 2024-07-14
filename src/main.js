import { app, BrowserWindow, ipcMain } from "electron";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const App = new (class {
    window = null;

    init() {
        this.window = new BrowserWindow({
            width: 700,
            height: 540,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
            },
            autoHideMenuBar: true,
            show: false,
        });
        this.window.loadFile(join(__dirname, "app.html"));
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
        ipcMain.handle("exit", () => app.exit());
    }
})();

app.once("ready", () => App.init());
