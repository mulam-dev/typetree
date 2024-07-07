Editor.sign_node_type({
    id: "core:null",
    scope: "null",
    name: "Null",
    visible: true,
    not_embedded: true,
    data: () => null,
    struct() {
        return $.view({class: "core-null core-s-code"}).mark_enabled(this);
    },
    cmds: {
        "confirm"() {
            this.parent.resolve_event(["switch"], this);
            return true;
        },
    },
});