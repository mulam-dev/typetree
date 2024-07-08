Editor.sign_node_type({
    id: "core:number",
    scope: "number",
    name: "Number",
    visible: true,
    not_embedded: true,
    data: () => 0,
    struct() {
        return $.view({class: "core-number-root core-s-code"}).mark_enabled(this);
    },
    setter() {
        this.root.do.set_text(this.data.toString());
    },
    cmds: {
        async "confirm"() {
            const res = await $.InlineEditor.do.request(this, {
                text: this.data.toString(),
                listen_cmds: ["insert_after", "outof", "up", "down"],
            });
            if (res !== null) {
                try {
                    this.data = Number.parseFloat(res);
                    this.update();
                } catch (_) {}
            }
            Editor.set_active_node(this);
            return true;
        },
        "insert_after"(src) {
            if (src === $.InlineEditor) {
                $.InlineEditor.do.confirm();
                return true;
            }
        },
        "up"(src) {
            if (src === $.InlineEditor) {
                try {
                    $.InlineEditor.do.set(0|(Number.parseFloat($.InlineEditor.do.get()) + 1).toString());
                } catch (_) {}
                return true;
            }
        },
        "down"(src) {
            if (src === $.InlineEditor) {
                try {
                    $.InlineEditor.do.set(0|(Number.parseFloat($.InlineEditor.do.get()) - 1).toString());
                } catch (_) {}
                return true;
            }
        },
        "outof"(src) {
            if (src === $.InlineEditor) {
                $.InlineEditor.do.cancel();
                return true;
            }
        },
    },
});