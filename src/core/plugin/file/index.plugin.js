const id = "#core:file"
const provides = [".core:file"]
const requires = {
    init: ".core:init-manager",
    icon: ".core:icon-loader",
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    ".core:shortcut:code" = {
        "Ctrl+KeyN"() {
            this.new_file();
        },
        "Ctrl+KeyO"() {
            this.open_file();
        },
        "Ctrl+KeyS"() {
            this.save();
        },
        "Ctrl+Shift+KeyS"() {
            this.save_as();
        },
    }

    init() {
        Names("File Menu", {"zh-CN": "文件菜单"});
        Names("New File", {"zh-CN": "新建文件"});
        Names("Open File...", {"zh-CN": "打开文件..."});
        Names("Save", {"zh-CN": "保存"});
        Names("Save As...", {"zh-CN": "另存为..."});

        const {after} = this.require.init;

        const layout = this.root.$require[".layout"];
        if (layout && native) {
            after(layout.loaded, async () => this.open_file(await native.app.get_arg()));
        }
    }

    data_path = [null]

    ".core:view"() {
        return {
            id,
            name: Names("File Menu"),
            icon: "menu-2",
            melem: div
                .class(cname("root"), "s-frame")
            (
                this.make_entry("file-plus", Names("New File"), "Ctrl + N", () => this.new_file()),
                this.make_entry("folder-open", Names("Open File..."), "Ctrl + O", () => this.open_file()),
                this.make_entry("device-floppy", Names("Save"), "Ctrl + S", () => this.save()),
                this.make_entry("device-floppy", Names("Save As..."), "Ctrl + Shift + S", () => this.save_as()),
            ),
        };
    }

    c_icon = this.require.icon.load;

    make_entry(icon, name, info, handle) {
        return div
            .class(cname("entry"), "s-item")
            .$on({"click": handle})
        (this.c_icon(icon), div.class("i-main")(name.get()), div.class("i-info")(info));
    }

    reloaded = Symbol("reloaded");

    on_reload() {
        this.require.init.finish(this.reloaded);
        this.root.$require[".core:timeline"]?.clear();
        setTimeout(() => {
            this.root.$require[".layout"]?.fit_size(true);
        }, 0);
    }

    new_file() {
        this.data_path.val = null;
        this.root.mod("modify", 0, this.root.inner.length, [this.root.$type[".json:null"]()]);
        this.on_reload();
    }

    async open_file(path) {
        if (native) {
            const file = path ? await native.app.open_file(path) : await native.app.open_file_dialog(this.data_path.val);
            if (file) {
                this.data_path.val = file.file_path;
                const json_obj = JSON.parse(file.data);
                this.root.mod("modify", 0, this.root.inner.length, [this.json_to_tree(json_obj)]);
                this.on_reload();
            }
        }
    }

    save() {
        if (native) {
            if (this.data_path.val) {
                native.app.save_file(this.data_path.val, JSON.stringify(this.root.inner.val.to_json(), null, 2));
            } else {
                this.save_as();
            }
        }
    }

    async save_as() {
        if (native) {
            const file_path = await native.app.save_file_as(this.data_path.val, JSON.stringify(this.root.inner.val.to_json(), null, 2));
            if (file_path) this.data_path.val = file_path;
        }
    }

    json_to_tree(json_obj) {
        const {$type} = this.root;
        if (json_obj === null) return $type[".json:null"]();
        switch (typeof json_obj) {
            case "boolean": return $type[".json:boolean"]([json_obj]);
            case "string": return $type[".json:string"]([json_obj]);
            case "number": return $type[".json:number"]([json_obj]);
            case "object":
                if (json_obj instanceof Array) {
                    return $type[".json:array"](json_obj.map(o => this.json_to_tree(o)));
                } else {
                    return $type[".json:object"](Object.keys(json_obj).map(k => [$type[".json:key"]([k]), this.json_to_tree(json_obj[k])]));
                }
        }
        throw -1;
    }
}

const {div} = ME;
const cname = name => "core-file-menu-" + name;