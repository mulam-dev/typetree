Editor.sign_node_type({
    id: "core:json-file",
    scope: "json_file",
    name: "JSON File",
    visible: false,
    not_embedded: true,
    data: () => ({
        path: null,
        data: $.null(),
    }),
    struct() {
        return $.view({class: "core-file-root l-level"}, [
            $.view({class: "i-zoom-hint core-s-code"}),
            $.view({class: "i-head"}, [
                $.view({class: "i-title"}).bind(this, "title"),
                $.view({class: "i-info", text: "JSON File"}),
            ]),
            $.view({class: "i-inner"}).bind(this, "inner"),
        ]).mark_enabled(this);
    },
    setter() {
        Elem(this.ref.title.elem).text(this.data.path ? this.data.path.split('/').pop() : "New File")
        this.ref.inner.do.add(this.data.data.mark_enabled(this));
    },
    resetter() {
        this.ref.inner.do.clear();
        this.clear_enabled_nodes();
    },
    methods: {
        set(node) {
            const src = this.data.data;
            node = node.mark_enabled(this);
            this.data.data = node;
            this.ref.inner.do.modify_at(0, 1, node);
            src.unmark_enabled();
            return src;
        },
    },
    cmds: {
        "insert_after"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.confirm();
                return true;
            }
        },
        "confirm"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.confirm();
                return true;
            }
        },
        "switch_prev"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.offset_sel(-1);
                return true;
            }
        },
        "switch_next"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.offset_sel(1);
                return true;
            }
        },
        "up"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.offset_sel(-1);
                return true;
            }
        },
        "down"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.offset_sel(1);
                return true;
            }
        },
        "outof"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.cancel();
                return true;
            } else if (this.data.data === src) {
                Editor.set_active_node(this);
                return true;
            }
        },
        "into"(src) {
            if (src === this.root) {
                Editor.set_active_node(this.data.data);
                return true;
            }
        },
        async "switch"(src) {
            if (this.data.data === src) {
                const prev_active_node = Editor.get_active_node();
                const elem = Elem(src.elem);
                elem.attr("zoom", 0);
                elem.addClass("t-zoom-root");
                Editor.set_active_node(src);
                const res = await $.TypeSelector.do.request(this, {
                    listen_cmds: [
                        "switch_next",
                        "switch_prev",
                        "insert_after",
                        "confirm",
                        "up",
                        "down",
                        "outof",
                    ],
                });
                elem.removeClass("t-zoom-root");
                elem.removeAttr("zoom");
                if (res) {
                    const node = Editor.make_node(res);
                    this.do.set(node);
                    Editor.set_active_node(node);
                } else {
                    Editor.set_active_node(prev_active_node);
                }
                return true;
            }
        },
        "delete"(src) {
            if (this.data.data === src) {
                if (this.data.data.is("core:null")) {
                    Editor.set_active_node(this);
                } else {
                    const temp_node = $.null();
                    this.do.set(temp_node);
                    Editor.set_active_node(temp_node);
                }
                return true;
            }
        },
    },
});