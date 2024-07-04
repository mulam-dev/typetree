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
    from_raw(raw) {
        if (raw instanceof Array) return raw;
        else return Object.keys(raw).map(k => [k, raw[k]]);
    },
    struct() {
        return $.div({class: "core-dict-root"}, [
            $.div({class: "core-dict-inner"}).bind(this, "inner"),
        ]).mark_active(this);
    },
    setter() {
        for (const [key, value] of this.data) {
            this.ref.inner.do.add(
                $.div({class: "i-key-box"}, [$.div({class: "i-key core-s-code", text: key})]).mark_active(this),
                value.mark_active(this),
            );
        }
    },
    resetter() {
        this.ref.inner.do.clear();
        this.clear_active_nodes();
    },
    cmds: {
        "confirm"() {
            // TODO
        },
    },
});