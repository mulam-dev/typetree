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

Editor.set_view($ =>
    $.div({}, [
        $.boolean(),
        $.boolean(true),
        $.string("Hello"),
        $.number(3.14),
    ]),
);