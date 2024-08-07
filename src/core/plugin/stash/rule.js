export default plugin => ({
    ".core:selection": {
        "handles.core:shortcut.code": {
            "Ctrl+KeyC"() {
                this.act("core:copy");
            },
            "Ctrl+KeyX"() {
                this.act("core:cut");
            },
            "Ctrl+KeyV"() {
                this.act("core:paste");
            },
        },
        "actions": {
            "core:copy": class extends TTAction {
                static name = Names("Copy")
                static icon = "copy"
                static call(sel) {
                    plugin.push(sel);
                }
            },
            "core:cut": class extends TTAction {
                static name = Names("Cut")
                static icon = "cut"
                static call(sel) {
                    plugin.push(sel);
                    sel.act("core:delete");
                }
            },
            "core:paste": class extends TTAction {
                static name = Names("Paste")
                static icon = "clipboard"
                static call(sel) {
                    sel.act("core:insert", plugin.get());
                }
            },
        },
    },
})