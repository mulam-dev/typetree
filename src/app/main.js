const Elem = jQuery;

class TypetreeNode {
    static do_handle = {
        get(node, key) {
            return node.opts.methods[key].bind(node);
        },
    };
    
    constructor(opts) {
        this.opts = opts;
    }

    construct(raw_data, ...rst) {
        const from_raw = this.opts.from_raw;
        const data = from_raw ? from_raw(raw_data) : raw_data;
        const constructor = this.opts.constructor;
        if (constructor) {
            constructor.call(this, data, ...rst);
        } else {
            const struct = this.opts.struct;
            const view = struct.call(this);
            this.root = view;
            this.elem = view.elem;
            if (data !== undefined) {
                this.data = data;
            } else if (this.opts.data !== undefined) {
                this.data = this.opts.data;
            }
            const setter = this.opts.setter;
            if (setter) setter.call(this);
        }
    }

    update() {
        const resetter = this.opts.resetter;
        if (resetter) resetter.call(this);
        const setter = this.opts.setter;
        if (setter) setter.call(this);
    }

    bind(target, key) {
        if (!target.ref) target.ref = {};
        target.ref[key] = this;
        return this;
    }

    mark_active(target) {
        if (!target.active_nodes) target.active_nodes = new Set();
        this.parent = target;
        this.set_active(target.active);
        target.active_nodes.add(this);
        return this;
    }

    unmark_active() {
        if (!target.active_nodes) target.active_nodes = new Set();
        delete this.parent;
        this.set_active(target.active);
        target.active_nodes.add(this);
        return this;
    }

    clear_active_nodes() {
        for (const node of this.active_nodes) {
            node.unmark_active();
        }
        delete this.active_nodes;
    }

    set_active(active) {
        if (active !== !!this.active) {
            this.active = active;
            const setter = this.opts.active_setter;
            if (setter) {
                setter.call(this, active);
            } else if (this.active_nodes) {
                for (const node of this.active_nodes) {
                    node.set_active(active);
                }
            }
        }
    }

    active(active = true) {
        this.set_active(active);
        return this;
    }

    resolve_event(cmds, source = null) {
        const cmd_handlers = this.opts.cmds;
        if (cmd_handlers) {
            for (const cmd of cmds) {
                const handle = cmd_handlers[cmd];
                if (handle) {
                    handle.call(this, source);
                    return;
                }
            }
        }
        if (this.parent) {
            this.parent.resolve_event(cmds, this);
        }
    }
}

Object.defineProperty(TypetreeNode.prototype, "do", {
    get() {
        return new Proxy(this, TypetreeNode.do_handle);
    },
});

globalThis.Editor = new (class {
    scope_handler = {
        get(scope, key) {
            return scope.get(key);
        },
    };

    constructor() {
        // Data Fields
        this.node_types = new Map();
        this.plugins = {};
        this.scope = new Map();

        // Elements
        this.e_root = Elem(".editor");
        this.e_inner = Elem(".ed-inner");
        this.e_overlay = Elem(".ed-overlay");
        this.e_cursor = Elem(".ed-overlay > .i-cursor");

        // Listeners
        this.anchor_elem = null;
        this.focus_elem = null;
        this.active_elem = null;
        this.prevent_click = false;
        Elem(document).on("pointerdown", e => {
            if (e.button === 0) {
                e.stopPropagation();
                const elem = this.closest_elem(Elem(e.target));
                this.anchor_elem = elem;
                this.focus_elem = null;
                // this.update_selection();
                if (elem && !elem.is(this.active_elem)) {
                    this.prevent_click = true;
                    e.preventDefault();
                }
                this.set_active_elem(elem);
                if (elem) {
                    this.e_root.focus();
                    Elem(document).one("pointerup", e => {
                        if (e.button === 0) {
                            setTimeout(() => {
                                this.prevent_click = false;
                            }, 0);
                        }
                    })
                }
            }
        });
        this.e_root.on("click", e => {
            if (!this.prevent_click && e.button === 0) {
                e.stopPropagation();
                const elem = this.closest_elem(Elem(e.target));
                if (elem) {
                    if (elem.is(this.active_elem)) e.preventDefault();
                    const node = elem[0].node;
                    node.resolve_event(["confirm"]);
                }
            }
        });
    }

    calc_size() {
        const root_offset = this.e_overlay.offset();
        return [].map(e => {
            const offset = e.offset();
            return [
                offset.left - root_offset.left + e.outerWidth() + 64,
                offset.top - root_offset.top + e.outerHeight() + 64,
            ];
        }).reduce(
            (prev, cur) => [Math.max(prev[0], cur[0]), Math.max(prev[1], cur[1])],
            [this.e_root.outerWidth(), this.e_root.outerHeight()],
        );
    }

    closest_elem(elem) {
        const active_elem = elem.closest(".t-active");
        if (active_elem.length > 0 && active_elem.closest(this.e_inner).length > 0) {
            return active_elem;
        } else {
            return null;
        }
    }

    set_active_elem(elem) {
        const cur_animation = this.e_cursor[0].getAnimations()[0];
        if (cur_animation) cur_animation.currentTime = 0;
        if (elem) {
            const root_offset = this.e_overlay.offset();
            const offset = elem.offset();
            this.e_cursor.css("--x", `${offset.left - root_offset.left}px`);
            this.e_cursor.css("--y", `${offset.top - root_offset.top}px`);
            this.e_cursor.css("--w", `${elem.outerWidth()}px`);
            this.e_cursor.css("--h", `${elem.outerHeight()}px`);
            this.e_cursor.addClass("f-show");
        } else {
            this.e_cursor.removeClass("f-show");
        }
        if (elem !== this.active_elem) {
            if (elem) elem.addClass("f-active");
            if (this.active_elem) this.active_elem.removeClass("f-active");
            this.active_elem = elem;
        }
    }

    sign_node_type(opts) {
        opts = {
            scope: null,
            name: null,
            visible: false,
            not_embedded: false,
            data: undefined,
            constructor: null,
            to_raw: null,
            from_raw: null,
            struct: null,
            setter: null,
            cmds: null,
            methods: {},
            ...opts,
        };
        this.node_types.set(opts.id, opts);
        if (opts.scope)
            this.scope.set(opts.scope, (...args) => {
                const node = new TypetreeNode(opts);
                node.construct(...args);
                return node;
            });
    }

    get_scope() {
        return new Proxy(this.scope, Editor.scope_handler);
    }

    set_view(view) {
        this.e_inner.empty().append(view.elem);
        update_win_size();
    }

    set_json(json_obj) {
        this.set_view(json_to_view(json_obj));
    }
})();

globalThis.$ = Editor.get_scope();

const json_to_view = json_obj => {
    switch (typeof json_obj) {
        case "boolean": return $.boolean(json_obj);
        case "string": return $.string(json_obj);
        case "number": return $.number(json_obj);
        case "object":
            if (json_obj instanceof Array) {
                return $.array(json_obj.map(json_to_view));
            } else {
                return $.dict(Object.keys(json_obj).map(k => [k, json_to_view(json_obj[k])]));
            }
    }
    throw -1;
};

const update_window_title = (title = null) => {
    document.title = title ? `${title}` : "TypeTree";
};

const update_win_size = () => {
    const win_width = window.innerWidth
    const win_height = window.innerHeight
    const [editor_width, editor_height] = Editor.calc_size()
    const delta_width = Math.round(editor_width - win_width)
    const delta_height = Math.round(editor_height - win_height)
    if (delta_width !== 0 || delta_height !== 0) window.resizeBy(delta_width, delta_height);
}

await import("./core/core.js");

if (globalThis.native) {
    native.on_file_opened(file => {
        if (file.file_path.endsWith(".json")) {
            try {
                const json_obj = JSON.parse(file.data);
                Editor.set_json(json_obj);
            } catch(e) {
                alert(e);
            }
        } else {
            alert(`Unsupport File: ${file.file_path}`);
        }
        update_window_title(file.file_path.split('/').pop());
        native.show_window(true);
    });
    native.on_blank_opened(() => {
        update_window_title();
        native.show_window(true);
    });

    native.app_ready();
}

// Tests

// console.log(Editor);

// Editor.set_view($ =>
//     $.div({text: "hello", class: "label"}, [
//         $.div({text: "world"}),
//     ]),
// );

// Editor.set_view($ =>
//     $.div({}, [
//         $.boolean(),
//         $.boolean(true),
//         $.string("Hello"),
//         $.number(3.14),
//     ]),
// );

// Editor.set_view(
//     $.array([
//         $.boolean(),
//         $.boolean(true),
//         $.string("Hello"),
//         $.number(3.14),
//         $.array([]),
//     ]).active(),
// );

// Editor.set_view(
//     $.dict({
//         "False": $.boolean(),
//         "True": $.boolean(true),
//         "String": $.string("Hello"),
//         "Number": $.number(3.14),
//         "Array": $.array([]),
//     }),
// );

// Editor.set_json({
//     "name": "typetree",
//     "homepage": "https://anlbrain.com/",
//     "author": "Lane Sun <lanesun@anlbrain.com> (https://lanesun.neocities.org/)",
//     "version": "1.0.0",
//     "main": "main.js",
//     "build": {
//         "productName": "TypeTree",
//         "appId": "com.anlbrain.typetree",
//         "icon": "icon.svg",
//         "linux": {
//             "target": "rpm"
//         },
//         "fileAssociations": [{
//             "ext": "typetree",
//             "name": "TypeTree File",
//             "role": "Editor",
//             "mimeType": "application/x-typetree"
//         },{
//             "ext": "json",
//             "name": "JSON File",
//             "role": "Editor",
//             "mimeType": "application/json"
//         }]
//     },
//     "scripts": {
//         "start": "electron .",
//         "package": "electron-builder"
//     },
//     "type": "module",
//     "devDependencies": {
//         "electron": "^31.1.0",
//         "electron-builder": "^24.13.3"
//     }
// });