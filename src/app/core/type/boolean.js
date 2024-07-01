Editor.sign_node_type({
    id: "core:boolean",
    scope: "boolean",
    name: "Boolean",
    visible: true,
    not_embedded: true,
    data: false,
    struct($) {
        return $.div({class: "core-boolean-root"});
    },
    setter() {
        if (this.data)
            this.root.do.add_class("f-active");
        else
            this.root.do.remove_class("f-active");
    },
    cmds: {
        "confirm"() {
            this.data = !this.data
            this.update();
        },
    },
});