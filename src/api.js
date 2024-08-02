if (globalThis.require) {

const { ipcRenderer } = require("electron");

globalThis.native = {};

native.app = new Proxy(ipcRenderer, {
    get(target, key) {
        if (key.startsWith("on_")) {
            return (...args) => target.on(key, ...args);
        } else {
            return (...args) => target.invoke(key, ...args);
        }
    },
});

} else globalThis.native = null;