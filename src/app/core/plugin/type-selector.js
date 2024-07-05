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
                        node.resolve_event(cmds, this);
                    }
                };
                const blur_handle = () => {
                    confirm();
                };
                this.e_input.on("keydown", keydown_handle);
                this.e_input.on("blur", blur_handle);
                const cleanup = () => {
                    this.e_input.off("keydown", keydown_handle);
                    this.e_input.off("blur", blur_handle);
                    delete this.h_confirm;
                    delete this.h_cancel;
                    this.elem.removeClass("f-show");
                };
                const confirm = value => {
                    cleanup();
                    resolve(value ?? this.e_input.text());
                };
                const cancel = () => {
                    cleanup();
                    resolve(null);
                };
                this.h_confirm = confirm;
                this.h_cancel = cancel;
                document.select(this.e_input);
            });
        },
        confirm(value = undefined) {
            if (this.h_confirm) this.h_confirm(value);
        },
        cancel() {
            if (this.h_cancel) this.h_cancel();
        },
        get() {
            return this.e_input.text();
        },
        set(text) {
            this.e_input.text(text);
            document.select(this.e_input);
        },
    },
});