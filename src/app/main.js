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

    construct(scope, data, ...rst) {
        const constructor = this.opts.constructor;
        if (constructor) {
            constructor.call(this, scope, data, ...rst);
        } else {
            const struct = this.opts.struct;
            const view = struct.call(this, scope);
            this.root = view;
            this.elem = view.elem;
            if (data !== undefined) {
                this.data = data;
            } else if (this.opts.data !== undefined) {
                this.data = this.opts.data;
            }
            const setter = this.opts.setter;
            if (setter) {
                setter.call(this);
            }
        }
    }

    bind(target, key) {
        if (!target.ref) target.ref = {};
        target.ref[key] = this;
        return this;
    }

    mark_active(target) {
        if (!target.active_nodes) target.active_nodes = new Set();
        this.set_active(target.active);
        target.active_nodes.add(this);
        return this;
    }

    clear_active_nodes() {
        for (const node of this.active_nodes) {
            node.set_active(false);
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
        this.plugins = new Map();
        this.scope = new Map();

        // Elements
        this.e_root = Elem(".editor");
        this.e_inner = Elem(".ed-inner");
        this.e_overlay = Elem(".ed-overlay");
        this.e_cursor = Elem(".ed-overlay > .i-cursor");

        // Listeners
        this.anchor_node = null;
        this.focus_node = null;
        this.active_node = null;
        this.e_root.on("pointerdown", e => {
            if (e.button === 0) {
                e.stopPropagation();
                const node = this.closest_node(Elem(e.target));
                this.anchor_node = node;
                this.focus_node = null;
                // this.update_selection();
                this.set_active_node(node);
                if (node) {
                    this.e_root.focus();
                }
            }
        });
    }

    closest_node(elem) {
        const node = elem.closest(".t-active");
        if (node.length > 0 && node.closest(this.e_inner).length > 0) {
            return node;
        } else {
            return null;
        }
    }

    set_active_node(node) {
        const cur_animation = this.e_cursor[0].getAnimations()[0];
        if (cur_animation) cur_animation.currentTime = 0;
        if (node) {
            const root_offset = this.e_overlay.offset();
            const offset = node.offset();
            this.e_cursor.css("--x", `${offset.left - root_offset.left}px`);
            this.e_cursor.css("--y", `${offset.top - root_offset.top}px`);
            this.e_cursor.css("--w", `${node.outerWidth()}px`);
            this.e_cursor.css("--h", `${node.outerHeight()}px`);
            this.e_cursor.addClass("f-show");
        } else {
            this.e_cursor.removeClass("f-show");
        }
        if (node !== this.active_node) {
            if (node) node.addClass("f-active");
            if (this.active_node) this.active_node.removeClass("f-active");
            this.active_node = node;
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
                node.construct(this.get_scope(), ...args);
                return node;
            });
    }

    get_scope() {
        return new Proxy(this.scope, Editor.scope_handler);
    }

    set_view(handle) {
        const view = handle(this.get_scope());
        this.e_inner.empty().append(view.elem);
    }
})();

await import("./core/core.js");

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

Editor.set_view($ =>
    $.array([
        $.boolean(),
        $.boolean(true),
        $.string("Hello"),
        $.number(3.14),
        $.array([]),
    ]).active(),
);