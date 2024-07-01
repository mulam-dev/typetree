Editor.sign_node_type({
    id: "core:number",
    scope: "number",
    name: "Number",
    visible: true,
    not_embedded: true,
    data: 0,
    struct($) {
        return $.div({class: "core-number-root"});
    },
    setter() {
        this.root.do.set_text(this.data.toString());
    },
    cmds: {
        async "confirm"($) {
            const res = await $.InlineTextEditor.request_text({
                anchor: this.root,
            });
            if (res !== null) {
                try {
                    this.data = Number.parseFloat(res);
                    this.update();
                } catch (_) {}
            }
        },
    },
});