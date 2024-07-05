const ATOM_NODE_TYPE = ["core:boolean", "core:number"];

const is_atom_node = n => {
    const type = n.get_type_id();
    return ATOM_NODE_TYPE.includes(type) || (type === "core:string" && n.do.get_length() <= 4);
};

const is_inline_data = data => data.length <= 8 && data.every(n => is_atom_node(n));

Editor.sign_node_type({
    id: "core:array",
    scope: "array",
    name: "Array",
    visible: true,
    not_embedded: true,
    data: [],
    struct() {
        return $.div({class: "core-array-root"}, [
            $.div({class: "i-inner"}).bind(this, "inner"),
        ]).mark_enabled(this);
    },
    setter() {
        if (is_inline_data(this.data)) {
            this.root.do.add_class("f-inline");
        }
        for (const item of this.data) {
            this.ref.inner.do.add(item.mark_enabled(this));
        }
    },
    resetter() {
        this.root.do.remove_class("f-inline");
        this.ref.inner.do.clear();
        this.clear_enabled_nodes();
    },
    methods: {
        insert_after(src, node) {
            if (src !== this.root) {
                node = node.mark_enabled(this);
                this.data.splice(this.data.indexOf(src) + 1, 0, node);
                this.ref.inner.do.insert_after(src, node);
                Editor.set_active_node(node);
                return true
            }
        },
        delete(src) {
            const index = this.data.indexOf(src);
            if (index >= 0) {
                this.ref.inner.do.delete(src);
                this.data.splice(index, 1);
                src.unmark_enabled();
                if (index >= 1) {
                    Editor.set_active_node(this.data[index - 1]);
                } else {
                    Editor.set_active_node(this);
                }
                return true;
            }
        },
    },
    cmds: {
        "insert_after"(src) {
            return this.do.insert_after(src, $.null());
        },
        "delete"(src) {
            return this.do.delete(src);
        }
    },
});