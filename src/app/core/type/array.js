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
        ]).mark_active(this);
    },
    setter() {
        if (is_inline_data(this.data)) {
            this.root.do.add_class("f-inline");
        }
        for (const item of this.data) {
            this.ref.inner.do.add(item.mark_active(this));
        }
    },
    resetter() {
        this.root.do.remove_class("f-inline");
        this.ref.inner.do.clear();
        this.clear_active_nodes();
    },
    cmds: {
        "confirm"() {
            // TODO
        },
    },
});