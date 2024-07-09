Editor.sign_plugin({
    id: "core:TypeSelector",
    scope: "TypeSelector",
    overlay() {
        return Elem(`
            <div class="ext-type-selector-root">
                <div class="i-input core-s-code" spellcheck="false" contenteditable></div>
                <div class="i-list"></div>
            </div>
        `);
    },
    init() {
        this.e_input = this.elem.children(".i-input");
        this.e_list = this.elem.children(".i-list");
    },
    methods: {
        request(node, opts = {}) {
            return new Promise(resolve => {
                this.e_input.text('');
                this.elem.addClass("f-show");
                const listen_cmds = opts.listen_cmds ?? [];
                const keydown_handle = e => {
                    const cmds = Editor.cvt_event(e);
                    if (listen_cmds.some(c => cmds.includes(c))) {
                        e.stopPropagation();
                        e.preventDefault();
                        node.resolve_event(cmds.filter(c => listen_cmds.includes(c)), this);
                    }
                };
                const input_handle = () => {
                    const text = this.e_input.text();
                    const types = Editor.fuzzy_query_node_type(text);
                    this.e_list.empty();
                    for (const type of types) {
                        this.e_list.append(Elem(`
                            <div class="ext-type-selector-entry core-s-code">
                                <div class="i-name">${type.name}</div>
                                <div class="i-info">${type.id}</div>
                            </div>
                        `).on("click", () => confirm(type)));
                    }
                    this.sel_index = 0;
                    this.types = types;
                    this.e_list.children().eq(this.sel_index).addClass("f-active");
                };
                const pointerdown_handle = e => {
                    if (!Elem(e.target).closest(this.elem).length) {
                        e.preventDefault();
                        e.stopPropagation();
                        cancel();
                    }
                };
                this.e_input.on("keydown", keydown_handle);
                this.e_input.on("input", input_handle);
                Elem(document).on("pointerdown", pointerdown_handle);
                const cleanup = () => {
                    this.e_input.off("keydown", keydown_handle);
                    this.e_input.off("input", input_handle);
                    Elem(document).off("pointerdown", pointerdown_handle);
                    delete this.h_confirm;
                    delete this.h_cancel;
                    this.elem.removeClass("f-show");
                };
                const confirm = value => {
                    cleanup();
                    resolve(value ?? this.types[this.sel_index]);
                };
                const cancel = () => {
                    cleanup();
                    resolve(null);
                };
                this.h_confirm = confirm;
                this.h_cancel = cancel;
                document.select(this.e_input);
                input_handle();
            });
        },
        confirm(value = undefined) {
            if (this.h_confirm) this.h_confirm(value);
        },
        cancel() {
            if (this.h_cancel) this.h_cancel();
        },
        offset_sel(offset) {
            if (this.types.length) {
                this.sel_index += offset;
                this.sel_index = this.sel_index < 0 ? this.types.length - 1 : this.sel_index >= this.types.length ? 0 : this.sel_index;
                this.e_list.children(".f-active").removeClass("f-active");
                this.e_list.children().eq(this.sel_index).addClass("f-active");
            }
        },
    },
});