Editor.sign_node_type({
    id: "core:dict",
    scope: "dict",
    name: "Dict",
    visible: true,
    not_embedded: true,
    data: () => [],
    to_raw() {
        const raw = {};
        for (const [key, value] of this.data) {
            raw[key] = value;
        }
        return raw;
    },
    from_raw(raw = {}) {
        if (raw instanceof Array) {
            return raw.map(([k, v]) => [k, v,
                $.view({class: "i-key-box"}, [
                    $.view({class: "i-key core-s-code"}, [
                        $.view({class: "i-text", text: k}),
                    ]),
                ]),
            ]);
        } else return Object.keys(raw).map(k => [k, raw[k],
            $.view({class: "i-key-box"}, [
                $.view({class: "i-key core-s-code"}, [
                    $.view({class: "i-text", text: k}),
                ]),
            ]),
        ]);
    },
    struct() {
        return $.view({class: "core-dict-root"}, [
            $.view({class: "core-dict-inner"}).bind(this, "inner"),
        ]).mark_enabled(this);
    },
    setter() {
        for (const [_, value, head] of this.data) {
            this.ref.inner.do.add(
                head.mark_enabled(this),
                value.mark_enabled(this),
            );
        }
    },
    resetter() {
        this.ref.inner.do.clear();
        this.clear_enabled_nodes();
    },
    methods: {
        insert(index, key, node) {
            if (index <= this.data.length) {
                const head = $.view({class: "i-key-box"}, [
                    $.view({class: "i-key core-s-code"}, [
                        $.view({class: "i-text", text: key}),
                    ]),
                ]);
                this.data.splice(index, 0, [key, node, head]);
                this.ref.inner.do.modify_at(index * 2, 0,
                    head.mark_enabled(this),
                    node.mark_enabled(this),
                );
                return true
            }
        },
        delete_value(index) {
            const src = this.data[index][1];
            if (!src.is("core:null")) {
                const temp_node = $.null().mark_enabled(this);
                this.ref.inner.do.modify(src, 1, temp_node);
                this.data[index][1] = temp_node;
                src.unmark_enabled();
                Editor.set_active_node(temp_node);
                return src;
            } else {
                Editor.set_active_node(this.data[index][2]);
                return null;
            }
        },
        delete_entry(index) {
            const entry = this.data[index];
            const [_, value, head] = entry;
            this.ref.inner.do.delete(value);
            this.ref.inner.do.delete(head);
            this.data.splice(index, 1);
            value.unmark_enabled();
            head.unmark_enabled();
            if (index >= 1) {
                Editor.set_active_node(this.data[index - 1][2]);
            } else if (this.data.length) {
                Editor.set_active_node(this.data[index][2]);
            } else {
                Editor.set_active_node(this);
            }
            return entry;
        },
        delete(src) {
            const index = this.ref.inner.do.get_index(src);
            if (index >= 0) {
                const idx = 0|(index / 2);
                if (index % 2 === 0) {
                    this.do.delete_entry(idx);
                } else {
                    this.do.delete_value(idx);
                }
                return true;
            }
        },
    },
    cmds: {
        "insert_before"(src) {
            const index = this.ref.inner.do.get_index(src);
            if (index >= 0) {
                const idx = 0|(index / 2);
                const temp_node = $.null();
                this.do.insert(idx, '', temp_node);
                this.resolve_event(["switch"], this.data[idx][2]);
                return true;
            }
        },
        "insert_after"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.confirm();
                return true;
            } else if (src === $.InlineEditor) {
                $.InlineEditor.do.confirm();
                return true;
            } else {
                const index = this.ref.inner.do.get_index(src);
                if (index >= 0) {
                    const idx = 0|(index / 2) + 1;
                    const temp_node = $.null();
                    this.do.insert(idx, '', temp_node);
                    this.resolve_event(["switch"], this.data[idx][2]);
                    return true;
                }
            }
        },
        "insert_into"(src) {
            if (src === this.root) {
                const idx = this.data.length;
                const temp_node = $.null();
                this.do.insert(idx, '', temp_node);
                this.resolve_event(["switch"], this.data[idx][2]);
                return true;
            }
        },
        "confirm"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.confirm();
                return true;
            } else {
                const index = this.ref.inner.do.get_index(src);
                if (index >= 0 && index % 2 === 0) {
                    this.resolve_event(["switch"], src);
                }
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
            } else {
                const index = this.ref.inner.do.get_index(src);
                if (index >= 0) {
                    if (index - 2 >= 0) {
                        Editor.set_active_node(this.ref.inner.do.get(index - 2));
                    }
                    return true;
                }
            }
        },
        "down"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.offset_sel(1);
                return true;
            } else {
                const index = this.ref.inner.do.get_index(src);
                if (index >= 0) {
                    if (index + 2 < this.data.length * 2) {
                        Editor.set_active_node(this.ref.inner.do.get(index + 2));
                    }
                    return true;
                }
            }
        },
        "left"(src) {
            const index = this.ref.inner.do.get_index(src);
            if (index >= 0) {
                if (index % 2 === 1) {
                    Editor.set_active_node(this.ref.inner.do.get(index - 1));
                }
                return true;
            }
        },
        "right"(src) {
            const index = this.ref.inner.do.get_index(src);
            if (index >= 0) {
                if (index % 2 === 0) {
                    Editor.set_active_node(this.ref.inner.do.get(index + 1));
                }
                return true;
            }
        },
        "outof"(src) {
            if (src === $.TypeSelector) {
                $.TypeSelector.do.cancel();
                return true;
            } else if (src === $.InlineEditor) {
                $.InlineEditor.do.cancel();
                return true;
            } else if (this.ref.inner.do.has(src)) {
                Editor.set_active_node(this);
                return true;
            }
        },
        "into"(src) {
            if (src === this.root && this.data.length) {
                Editor.set_active_node(this.data[0][2]);
                return true;
            }
        },
        async "switch"(src) {
            const index = this.ref.inner.do.get_index(src);
            if (index >= 0) {
                const prev_active_node = Editor.get_active_node();
                Editor.set_active_node(src);
                const idx = 0|(index / 2);
                const entry = this.data[idx];
                if (index % 2 === 0) {
                    const res = await $.InlineEditor.do.request(this, {
                        text: entry[0],
                        listen_cmds: ["insert_after", "outof"],
                    });
                    if (res !== null) {
                        entry[0] = res;
                        Elem(entry[2].elem).find(".i-text").text(res);
                        Editor.set_active_node(entry[2]);
                    } else {
                        if (src.elem !== prev_active_node.elem) this.do.delete(src);
                        Editor.set_active_node(prev_active_node);
                    }
                } else {
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
                    if (res) {
                        const node = Editor.make_node(res);
                        this.do.insert(idx, entry[0], node);
                        this.do.delete(entry[2]);
                        Editor.set_active_node(node);
                    } else {
                        if (src.elem !== prev_active_node.elem) this.do.delete(src);
                        Editor.set_active_node(prev_active_node);
                    }
                }
                return true;
            }
        },
        "delete"(src) {
            return this.do.delete(src);
        },
    },
});