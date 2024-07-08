Editor.sign_plugin({
    id: "core:InlineEditor",
    scope: "InlineEditor",
    overlay() {
        return Elem(`
            <div class="ext-inline-editor-root">
                <div class="i-view core-s-code"></div>
                <textarea class="i-input core-s-code" rows="1" spellcheck="false"></textarea>
            </div>
        `);
    },
    init() {
        this.e_view = this.elem.children(".i-view");
        this.e_input = this.elem.children(".i-input");
    },
    methods: {
        request(node, opts = {}) {
            return new Promise(resolve => {
                const tab = opts.tab ?? ''.padEnd(4, ' ');
                this.elem.attr("prefix", opts.prefix ?? '');
                this.elem.attr("postfix", opts.postfix ?? '');
                this.elem.addClass("f-show");
                this.e_input.css("--offset", this.e_view.position().left + "px");
                const listen_cmds = opts.listen_cmds ?? [];
                const keydown_handle = e => {
                    const cmds = Editor.cvt_event(e);
                    if (listen_cmds.some(c => cmds.includes(c))) {
                        e.stopPropagation();
                        e.preventDefault();
                        node.resolve_event(cmds, this);
                    } else {
                        if (e.key === 'Tab') {
                            e.stopPropagation();
                            e.preventDefault();
                            const self = this.e_input[0];
                            const start = self.selectionStart;
                            const end = self.selectionEnd;
                            self.value = self.value.slice(0, start) + tab + self.value.slice(end);
                            self.selectionStart = self.selectionEnd = start + tab.length;
                            input_handle();
                        }
                    }
                };
                const input_handle = () => {
                    this.e_input.css("height", "auto");
                    this.e_input.css("height", this.e_input[0].scrollHeight + "px");
                    this.e_view.text(this.e_input.val());
                };
                const blur_handle = () => {
                    confirm();
                };
                this.e_input.on("keydown", keydown_handle);
                this.e_input.on("input", input_handle);
                this.e_input.on("blur", blur_handle);
                const cleanup = () => {
                    this.e_input.off("keydown", keydown_handle);
                    this.e_input.off("input", input_handle);
                    this.e_input.off("blur", blur_handle);
                    delete this.h_confirm;
                    delete this.h_cancel;
                    delete this.h_set;
                    delete this.h_get;
                    this.elem.removeClass("f-show");
                };
                const confirm = value => {
                    cleanup();
                    resolve(value ?? this.e_input.val());
                };
                const cancel = () => {
                    cleanup();
                    resolve(null);
                };
                const set = (v) => {
                    this.e_input.val(v);
                    this.e_input.select();
                    input_handle();
                };
                const get = () => this.e_input.val();
                this.h_confirm = confirm;
                this.h_cancel = cancel;
                this.h_set = set;
                this.h_get = get;
                set(opts.text ?? '');
            });
        },
        confirm(value = undefined) {
            if (this.h_confirm) this.h_confirm(value);
        },
        cancel() {
            if (this.h_cancel) this.h_cancel();
        },
        get() {
            return this.h_get.call(this);
        },
        set(v) {
            this.h_set.call(this, v);
        },
    },
});