Editor.sign_node_type({
    id: "core:boolean",
    scope: "boolean",
    name: "Boolean",
    visible: true,
    not_embedded: true,
    data: false,
    struct($) {
        return $.div({class: "core-boolean-root"}).mark_active(this);
    },
    setter() {
        if (this.data)
            this.root.do.add_class("f-toggle");
        else
            this.root.do.remove_class("f-toggle");
    },
    cmds: {
        "confirm"() {
            this.data = !this.data
            this.update();
        },
    },
});