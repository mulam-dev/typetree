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
        for (const item of this.data) {
            this.ref.inner.do.add(item.mark_active(this));
        }
    },
    resetter() {
        this.ref.inner.do.clear();
        this.clear_active_nodes();
    },
    cmds: {
        "confirm"() {
            // TODO
        },
    },
});