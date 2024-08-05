const id = "#core:shortcut"
const provides = [".core:shortcut"]
const requires = {
    base: ".core:base",
    init: ".core:init-manager",
    layout: ".layout",
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    data_shortcut_key_map = {}
    data_shortcut_code_map = {}

    async init() {
        const {for_plugins_prop} = this.require.base;
        await for_plugins_prop(".core:shortcut:key", (plugin, shortcuts) => {
            for (const key in shortcuts) {
                this.data_shortcut_key_map[key] ??= [];
                this.data_shortcut_key_map[key].push(shortcuts[key].bind(plugin));
            }
        });
        await for_plugins_prop(".core:shortcut:code", (plugin, shortcuts) => {
            for (const code in shortcuts) {
                this.data_shortcut_code_map[code] ??= [];
                this.data_shortcut_code_map[code].push(shortcuts[code].bind(plugin));
            }
        });
        const {after, all} = this.require.init;
        after(all(
            this.require.layout.loaded,
        ), () => this.load());
    }

    async load() {
        const {selections} = this.require.layout;
        this.root.melem.attr("on", {}).modify("keydown", e => {
            if (this.root.focused()) {
                e.stopPropagation();
                e.preventDefault();
                const shortcut_code = `${e.ctrlKey ? "Ctrl+" : ""}${e.altKey ? "Alt+" : ""}${e.shiftKey ? "Shift+" : ""}${e.code}`;
                const shortcut_key = `${e.ctrlKey ? "Ctrl+" : ""}${e.altKey ? "Alt+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key}`;
                let requested =
                    selections.some(sel => sel.request(`core:shortcut.code.${shortcut_code}`, e).called) ||
                    selections.some(sel => sel.request(`core:shortcut.key.${shortcut_key}`, e).called);
                for (const handle of this.data_shortcut_code_map[shortcut_code] ?? []) {
                    if (!requested) {
                        handle();
                        requested = true;
                    }
                }
                for (const handle of this.data_shortcut_key_map[shortcut_key] ?? []) {
                    if (!requested) {
                        handle();
                        requested = true;
                    }
                }
            }
        });
    }
}