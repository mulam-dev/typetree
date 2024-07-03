Editor.sign_node_type({
    id: "core:string",
    scope: "string",
    name: "String",
    visible: true,
    not_embedded: true,
    data: "",
    struct() {
        return $.div({class: "core-string-root core-s-code"}).mark_active(this);
    },
    setter() {
        this.root.do.set_text(this.data);
        if (this.data.length)
            this.root.do.remove_class("f-blank");
        else
            this.root.do.add_class("f-blank");
    },
    cmds: {
        async "confirm"() {
            const res = await Editor.plugins.InlineTextEditor.request_text({
                anchor: this.root,
            });
            if (res !== null) {
                this.data = res;
                this.update();
            }
        },
    },
});