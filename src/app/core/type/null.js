Editor.sign_node_type({
    id: "core:null",
    scope: "null",
    name: "Null",
    visible: true,
    not_embedded: true,
    data: null,
    struct() {
        return $.div({class: "core-null core-s-code"}).mark_enabled(this);
    },
    cmds: {
        "confirm"() {
            // TODO
        },
    },
});