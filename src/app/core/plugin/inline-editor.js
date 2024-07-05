Editor.sign_plugin({
    scope: "InlineEditor",
    overlay() {
        return Elem(`
            <div class="ext-inline-editor-root">
                <div class="i-input" contenteditable></div>
            </div>
        `);
    },
    init() {
        this.e_root = Elem(".ext-inline-editor-root");
        this.e_input = Elem(".ext-inline-editor-root > .i-input");
    },
    methods: {
        request_text(opts = {}) {
            //
        },
    },
});