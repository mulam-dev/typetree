const ATOM_NODE_TYPE = ["core:null", "core:boolean", "core:number"];

const is_atom_node = n => {
    const type = n.get_type_id();
    return ATOM_NODE_TYPE.includes(type) || (type === "core:string" && n.do.get_length() <= 4);
};

const is_inline_data = data => data.length <= 8 && data.every(n => is_atom_node(n));

const update_style = self => {
    if (is_inline_data(self.data)) {
        self.root.do.add_class("f-inline");
    } else {
        self.root.do.remove_class("f-inline");
    }
};

Editor.sign_node_type({
    id: "core:array",
    scope: "array",
    name: "Array",
    visible: true,
    not_embedded: true,
    data: () => [],
    struct() {
        return $.view({class: "core-array-root"}, [
            $.view({class: "i-inner"}).bind(this, "inner"),
        ]).mark_enabled(this);
    },
    setter() {
        update_style(this);
        for (const item of this.data) {
            this.ref.inner.do.add(item.mark_enabled(this));
        }
    },
    resetter() {
        this.ref.inner.do.clear();
        this.clear_enabled_nodes();
    },
    methods: {
        insert(index, node) {
            if (index <= this.data.length) {
                node = node.mark_enabled(this);
                this.data.splice(index, 0, node);
                update_style(this);
                this.ref.inner.do.insert(index, node);
                return true
            }
        },
        delete(src) {
            const index = this.data.indexOf(src);
            if (index >= 0) {
                this.ref.inner.do.delete(src);
                this.data.splice(index, 1);
                update_style(this);
                src.unmark_enabled();
                if (index >= 1) {
                    Editor.set_active_node(this.data[index - 1]);
                } else if (this.data.length) {
                    Editor.set_active_node(this.data[index]);
                } else {
                    Editor.set_active_node(this);
                }
                return true;
            }
        },
    },
    cmds: {
        "insert_before"(src) {
            if (this.data.includes(src)) {
                const temp_node = $.null();
                this.do.insert(this.data.indexOf(src), temp_node);
                this.resolve_event(["switch"], temp_node);
                return true;
            }
        },
        "insert_after"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.confirm();
                return true;
            } else if (this.data.includes(src)) {
                const temp_node = $.null();
                this.do.insert(this.data.indexOf(src) + 1, temp_node);
                this.resolve_event(["switch"], temp_node);
                return true;
            }
        },
        "insert_into"(src) {
            if (src === this.root) {
                const temp_node = $.null();
                this.do.insert(this.data.length, temp_node);
                this.resolve_event(["switch"], temp_node);
                return true;
            }
        },
        "confirm"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.confirm();
                return true;
            }
        },
        "switch_prev"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.offset_sel(-1);
                return true;
            }
        },
        "switch_next"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.offset_sel(1);
                return true;
            }
        },
        "up"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.offset_sel(-1);
                return true;
            }
        },
        "down"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.offset_sel(1);
                return true;
            }
        },
        "prev"(src) {
            if (this.data.includes(src)) {
                const src_index = this.data.indexOf(src);
                const index = Math.max(0, src_index - 1);
                Editor.set_active_node(this.data[index]);
                return true;
            }
        },
        "next"(src) {
            if (this.data.includes(src)) {
                const src_index = this.data.indexOf(src);
                const index = Math.min(this.data.length - 1, src_index + 1);
                Editor.set_active_node(this.data[index]);
                return true;
            }
        },
        "outof"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.cancel();
                return true;
            } else if (this.data.includes(src)) {
                Editor.set_active_node(this);
                return true;
            }
        },
        "into"(src) {
            if (src === this.root && this.data.length) {
                Editor.set_active_node(this.data[0]);
                return true;
            }
        },
        async "switch"(src) {
            if (this.data.includes(src)) {
                const prev_active_node = Editor.get_active_node();
                Editor.set_active_node(src);
                const res = await $.TypeSelector.do.request(this, {
                    listen_cmds: [
                        "switch_next",
                        "switch_prev",
                        "insert_after",
                        "confirm",
                        "up",
                        "down",
                        "outof",
                    ],
                });
                if (res) {
                    const node = Editor.make_node(res);
                    this.do.insert(this.data.indexOf(src), node);
                    this.do.delete(src);
                    Editor.set_active_node(node);
                } else {
                    if (src.elem !== prev_active_node.elem) this.do.delete(src);
                    Editor.set_active_node(prev_active_node);
                }
                return true;
            }
        },
        "delete"(src) {
            return this.do.delete(src);
        },
    },
});