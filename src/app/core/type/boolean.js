Editor.sign_node_type({
    id: "core:boolean",
    scope: "boolean",
    name: "Boolean",
    visible: true,
    not_embedded: true,
    data: {
        value: false,
    },
    to_raw() {
        return this.data.value;
    },
    from_raw(value) {
        this.data.value = value;
    },
    struct($) {
        return $.div({class: "core-boolean-root"}, [
            $.div({class: "i-indicator"}),
        ]);
    },
    setter() {
        if (this.data.value)
            this.root.classList.add("f-active");
        else
            this.root.classList.remove("f-active");
    },
    cmds: {
        "confirm"() {
            this.data.value = !this.data.value
            this.update();
        },
    },
});