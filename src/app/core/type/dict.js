Editor.sign_node_type({
    id: "core:dict",
    scope: "dict",
    name: "Dict",
    visible: true,
    not_embedded: true,
    data: [],
    to_raw() {
        const raw = {};
        for (const [key, value] of this.data) {
            raw[key] = value;
        }
        return raw;
    },
    from_raw(raw = {}) {
        if (raw instanceof Array) return raw;
        else return Object.keys(raw).map(k => [k, raw[k]]);
    },
    struct() {
        return $.div({class: "core-dict-root"}, [
            $.div({class: "core-dict-inner"}).bind(this, "inner"),
        ]).mark_enabled(this);
    },
    setter() {
        for (const [key, value] of this.data) {
            this.ref.inner.do.add(
                $.div({class: "i-key-box"}, [
                    $.div({class: "i-key core-s-code"}, [
                        $.div({class: "i-text", text: key}),
                    ]),
                ]).mark_enabled(this),
                value.mark_enabled(this),
            );
        }
    },
    resetter() {
        this.ref.inner.do.clear();
        this.clear_enabled_nodes();
    },
    cmds: {
        "confirm"() {
            // TODO
        },
    },
});