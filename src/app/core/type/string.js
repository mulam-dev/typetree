Editor.sign_node_type({
    id: "core:string",
    scope: "string",
    name: "String",
    visible: true,
    not_embedded: true,
    data: "",
    struct() {
        return $.div({class: "core-string-root core-s-code"}).mark_enabled(this);
    },
    setter() {
        this.root.do.set_text(this.data);
        if (this.data.length)
            this.root.do.remove_class("f-blank");
        else
            this.root.do.add_class("f-blank");
    },
    methods: {
        get_length() {
            return this.data.length;
        },
    },
    cmds: {
        async "confirm"() {
            const res = await $.InlineEditor.do.request(this, {
                text: this.data,
                listen_cmds: ["insert_after"],
                prefix: '"', postfix: '"',
            });
            if (res !== null) {
                this.data = res;
                this.update();
                Editor.set_active_node(this);
            }
            return true;
        },
        "insert_after"(src) {
            if (src instanceof EditorPlugin) {
                $.InlineEditor.do.confirm();
                return true;
            }
        },
    },
});