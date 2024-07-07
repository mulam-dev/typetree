globalThis.Elem = jQuery;

document.select = elem => {
    elem = Elem(elem);
    const sel = window.getSelection();
    sel.removeAllRanges();
    for (const node of elem) sel.selectAllChildren(node);
};

const CmdMap = {
  confirm:          ["Space"],
  insert_after:     ["Enter"],
  insert_before:    ["Shift+Enter"],
  insert_to:        ["Ctrl+Enter"],
  insert_into:      ["Insert"],
  insert_outof:     ["Shift+Insert"],
  delete:           ["Delete", "Backspace"],
  switch:           ["Tab"],
  switch_next:      ["Tab"],
  switch_prev:      ["Shift+Tab"],
  into:             ["Alt+Enter"],
  outof:            ["Escape"],
  up:               ["ArrowUp"],
  right:            ["ArrowRight"],
  down:             ["ArrowDown"],
  left:             ["ArrowLeft"],
  next:             ["ArrowDown", "ArrowRight"],
  prev:             ["ArrowUp", "ArrowLeft"],
  select_up:        ["Shift+ArrowUp"],
  select_right:     ["Shift+ArrowRight"],
  select_down:      ["Shift+ArrowDown"],
  select_left:      ["Shift+ArrowLeft"],
  select_next:      ["Shift+ArrowDown", "Shift+ArrowRight"],
  select_prev:      ["Shift+ArrowUp", "Shift+ArrowLeft"],
  move_up:          ["Ctrl+ArrowUp"],
  move_right:       ["Ctrl+ArrowRight"],
  move_down:        ["Ctrl+ArrowDown"],
  move_left:        ["Ctrl+ArrowLeft"],
  move_next:        ["Ctrl+ArrowDown", "Ctrl+ArrowRight"],
  move_prev:        ["Ctrl+ArrowTop", "Ctrl+ArrowLeft"],
};

const ShortcutMap = Object
    .keys(CmdMap).flatMap(c => CmdMap[c].map(s => [s, c]))
    .reduce((map, [s, c]) => {
        if (!map.has(s))
            map.set(s, [c]);
        else
            map.get(s).push(c);
        return map;
    }, new Map());

class TypetreeNode {
    static do_handle = {
        get(node, key) {
            return node.opts.methods[key].bind(node);
        },
    };
    
    constructor(opts) {
        this.opts = opts;
    }

    is(type_id) {
        return type_id === this.opts.id;
    }

    get_type_id() {
        return this.opts.id;
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
                this.data = this.opts.data.call(this);
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

    mark_enabled(target) {
        if (!target.enabled_nodes) target.enabled_nodes = new Set();
        this.parent = target;
        this.set_enabled(target.enabled);
        target.enabled_nodes.add(this);
        return this;
    }

    unmark_enabled() {
        const target = this.parent;
        delete this.parent;
        this.set_enabled(false);
        target.enabled_nodes.delete(this);
        return this;
    }

    clear_enabled_nodes() {
        for (const node of this.enabled_nodes) {
            node.unmark_enabled();
        }
        delete this.enabled_nodes;
    }

    has_enabled_node(node) {
        return this.enabled_nodes && this.enabled_nodes.has(node);
    }

    set_enabled(enabled) {
        if (enabled !== !!this.enabled) {
            this.enabled = enabled;
            const setter = this.opts.enable_setter;
            if (setter) {
                setter.call(this, enabled);
            } else if (this.enabled_nodes) {
                for (const node of this.enabled_nodes) {
                    node.set_enabled(enabled);
                }
            }
        }
    }

    enable(enabled = true) {
        this.set_enabled(enabled);
        return this;
    }

    async resolve_event(cmds, source = null) {
        const cmd_handlers = this.opts.cmds;
        if (cmd_handlers) {
            for (const cmd of cmds) {
                const handle = cmd_handlers[cmd];
                if (handle && await handle.call(this, source)) {
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

globalThis.TypetreeNode = TypetreeNode;

class EditorPlugin {
    static do_handle = {
        get(plugin, key) {
            return plugin.opts.methods[key].bind(plugin);
        },
    };

    constructor(opts) {
        this.opts = opts;
    }
    init() {
        const overlay = this.opts.overlay;
        if (overlay) {
            this.elem = Elem(overlay.call(this));
        } else {
            this.elem = Elem();
        }
        const initer = this.opts.init;
        if (initer) {
            initer.call(this);
        }
    }
}

Object.defineProperty(EditorPlugin.prototype, "do", {
    get() {
        return new Proxy(this, EditorPlugin.do_handle);
    },
});

globalThis.EditorPlugin = EditorPlugin;

globalThis.Editor = new (class {
    scope_handler = {
        get(scope, key) {
            return scope.get(key);
        },
    };

    constructor() {
        // Data Fields
        this.node_types = new Map();
        this.plugins = new Map();
        this.scope = new Map();
        this.node_type_name_map = new Map();

        // Elements
        this.e_root = Elem(".editor");
        this.e_inner = Elem(".ed-inner");
        this.e_overlay = Elem(".ed-overlay");
        this.e_cursor = Elem(".ed-overlay > .i-cursor");

        // Listeners
        this.anchor_elem = Elem();
        this.focus_elem = Elem();
        this.active_elem = Elem();
        this.prevent_click = false;
        Elem(document).on("pointerdown", e => {
            if (e.button === 0) {
                const elem = this.closest_elem(Elem(e.target));
                this.anchor_elem = elem;
                this.focus_elem = null;
                // this.update_selection();
                if (elem.length && !elem.is(this.active_elem)) {
                    this.prevent_click = true;
                    e.stopPropagation();
                    e.preventDefault();
                }
                this.set_active_elem(elem);
                if (elem.length) {
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
        this.e_root.on("keydown", e => {
            if (this.e_root.is(":focus") && this.active_elem.length) {
                e.stopPropagation();
                e.preventDefault();
                const node = this.get_active_node();
                node.resolve_event(Editor.cvt_event(e));
            }
        });
        this.e_root.on("dblclick", e => {
            if (!this.prevent_click && e.button === 0) {
                const elem = this.closest_elem(Elem(e.target));
                if (elem.length) {
                    if (elem.is(this.active_elem)) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    const node = elem[0].node;
                    node.resolve_event(["confirm"]);
                }
            }
        });
    }

    get_size() {
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

    calc_rect(elem) {
        elem = Elem(elem);
        const root_offset = this.e_overlay.offset();
        const offset = elem.offset();
        return [
            offset.left - root_offset.left,
            offset.top - root_offset.top,
            elem.outerWidth(),
            elem.outerHeight(),
        ];
    }

    closest_elem(elem) {
        const active_elem = elem.closest(".t-active");
        if (active_elem.length > 0 && active_elem.closest(this.e_inner).length > 0) {
            return active_elem;
        } else {
            return Elem();
        }
    }

    cvt_event(e) {
        const shortcut = `${e.ctrlKey ? "Ctrl+" : ""}${e.altKey ? "Alt+" : ""}${e.shiftKey ? "Shift+" : ""}${e.code}`;
        const cmds = ShortcutMap.get(shortcut) ?? [];
        return cmds;
    }

    update_cursor_rect() {
        const elem = this.active_elem;
        if (elem.length) {
            const [x, y, w, h] = this.calc_rect(elem);
            this.e_overlay.css("--cursor-x", `${x}px`);
            this.e_overlay.css("--cursor-y", `${y}px`);
            this.e_overlay.css("--cursor-w", `${w}px`);
            this.e_overlay.css("--cursor-h", `${h}px`);
        }
    }

    set_active_elem(elem) {
        elem = Elem(elem);
        const cur_animation = this.e_cursor[0].getAnimations()[0];
        if (cur_animation) cur_animation.currentTime = 0;
        if (elem.length) {
            this.e_cursor.addClass("f-show");
            this.e_root.focus();
        } else {
            this.e_cursor.removeClass("f-show");
        }
        if (!elem.is(this.active_elem)) {
            if (this.active_elem.length) this.active_elem.removeClass("f-active");
            if (elem.length) elem.addClass("f-active");
            this.active_elem = elem;
        }
        this.update_cursor_rect();
    }

    set_active_node(node) {
        this.set_active_elem(node.elem);
    }

    get_active_node() {
        return this.active_elem.length ? this.active_elem[0].node : null;
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
        if (opts.visible && opts.name) this.node_type_name_map.set(opts.name.toLowerCase(), opts);
        if (opts.scope)
            this.scope.set(opts.scope, (...args) => this.make_node(opts, ...args));
    }

    sign_plugin(opts) {
        opts = {
            scope: null,
            overlay: null,
            init: null,
            methods: {},
            ...opts,
        };
        const plugin = new EditorPlugin(opts);
        plugin.init();
        this.plugins.set(opts.id, plugin);
        if (opts.scope) {
            this.scope.set(opts.scope, plugin);
        }
        this.e_overlay.append(plugin.elem);
    }

    make_node(type, ...args) {
        const node = new TypetreeNode(type);
        node.construct(...args);
        return node;
    }

    fuzzy_query_node_type(str) {
        str = str.toLowerCase();
        if (str === '') {
            return [...this.node_type_name_map.entries()]
                .sort(([name_a], [name_b]) => name_a < name_b ? -1 : name_a === name_b ? 0 : 1)
                .map(e => e[1]);
        } else {
            const score_to_opts_list = [];
            for (const [name, opts] of this.node_type_name_map) {
                const score = fuzzy_score(name, str);
                if (score > 0) score_to_opts_list.push([score, opts]);
            }
            score_to_opts_list.sort((a, b) => b[0] - a[0]);
            return score_to_opts_list.map(e => e[1]);
        }
    }

    get_scope() {
        return new Proxy(this.scope, Editor.scope_handler);
    }

    set_view(view) {
        this.e_inner.empty().append(view.enable().elem);
        // update_win_size();
    }

    set_json(json_obj) {
        this.set_view(json_to_view(json_obj));
    }
})();

globalThis.$ = Editor.get_scope();

const fuzzy_score = (str, pattern) => {
    let score = 0;
    let start_index = 0;
    for (const c of pattern) {
        const new_index = str.indexOf(c, start_index);
        if (new_index >= 0) {
            start_index = new_index + 1;
            score += 2 ** -(new_index + 1);
        } else {
            return 0;
        }
    }
    return score;
};

const json_to_view = json_obj => {
    if (json_obj === null) return $.null();
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
    const [editor_width, editor_height] = Editor.get_size()
    const delta_width = Math.round(editor_width - win_width)
    const delta_height = Math.round(editor_height - win_height)
    if (delta_width !== 0 || delta_height !== 0) window.resizeBy(delta_width, delta_height);
}

await import("./core/core.js");

if (globalThis.native) {
    native.on_file_opened(file => {
        if (file.file_path.endsWith(".json")) {
            try {
                update_window_title(file.file_path.split('/').pop());
                const json_obj = JSON.parse(file.data);
                Editor.set_json(json_obj);
                native.show_window(true);
                return;
            } catch(e) {
                alert(e);
                console.error(e);
            }
        } else {
            alert(`Unsupport File: ${file.file_path}`);
        }
        native.exit();
        window.close();
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
//         $.boolean(true, false),
//         $.string("Hello"),
//         $.number(3.14),
//         $.array([]),
//     ]),
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