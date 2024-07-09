Editor.sign_node_type({
    id: "core:tutorial",
    scope: "tutorial",
    name: "Tutorial",
    visible: false,
    not_embedded: true,
    data: () => null,
    struct() {
        return $.view({class: "core-tutorial"}).mark_enabled(this);
    },
    setter() {
        Elem(this.elem).append(Elem(`
            <img src="icon.svg" width="200" />
            <div class="p-cmd-box">
                <div class="i-entry">Open File</div>
                <div class="i-entry">
                    <div class="i-key">Ctrl</div>
                    <div class="i-key">O</div>
                </div>
                <div class="i-entry">Save</div>
                <div class="i-entry">
                    <div class="i-key">Ctrl</div>
                    <div class="i-key">S</div>
                </div>
                <div class="i-entry">Save As</div>
                <div class="i-entry">
                    <div class="i-key">Ctrl</div>
                    <div class="i-key">Shift</div>
                    <div class="i-key">S</div>
                </div>
                <div class="i-entry">Switch Type</div>
                <div class="i-entry">
                    <div class="i-key">Tab</div>
                </div>
                <div class="i-entry">Out of Struct</div>
                <div class="i-entry">
                    <div class="i-key">Esc</div>
                </div>
                <div class="i-entry">Into of Struct</div>
                <div class="i-entry">
                    <div class="i-key">Alt</div>
                    <div class="i-key">Enter</div>
                </div>
                <div class="i-entry">Insert After</div>
                <div class="i-entry">
                    <div class="i-key">Enter</div>
                </div>
                <div class="i-entry">Insert Before</div>
                <div class="i-entry">
                    <div class="i-key">Shift</div>
                    <div class="i-key">Enter</div>
                </div>
                <div class="i-entry">Edit/Confirm</div>
                <div class="i-entry">
                    <div class="i-key">Space</div>
                </div>
            </div>
        `));
    },
    resetter() {
        this.root.do.clear();
    }
});