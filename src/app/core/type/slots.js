Editor.sign_node_type({
    id: "core:slots",
    scope: "slots",
    name: "Slots",
    visible: false,
    not_embedded: true,
    data: {
        items: [],
    },
    struct() {
        return $.div({class: "core-slots-root"});
    },
    setter() {
        // for (const item of this.data.items)
        //     this.root.append
    },
    cmds: {
        "confirm"() {
            this.data.value = !this.data.value
            this.update();
        },
    },
});