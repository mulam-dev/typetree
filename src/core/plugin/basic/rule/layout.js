export default {
    ".core:editor": {
        "able.core:layout.select": true,
        "handles.core:layout": {
            "get-selection"(p, anchor_node, focus_node) {
                let anchor = this.inner.indexOf(anchor_node);
                let focus = this.inner.indexOf(focus_node);
                if (anchor <= focus) {
                    focus++;
                } else {
                    anchor++;
                }
                return this.$type["#core:selection"]({
                    scope: this,
                    anchor, focus,
                });
            },
        },
        "handles.core:escape"(p, sel, node) {
            sel.data_scope.val = this;
            const offset = this.inner.indexOf(node);
            sel.set(offset, offset + 1);
        },
        "handles.core:selection": {
            "resolve"(p, {anchor, focus}) {
                return ["range", this.inner.slice(...[anchor, focus].num_sorted())];
            },
            "dir"(p) {
                return {};
            },
            "collapsed"(p) {
                return false;
            },
            "side"(p, dir, pos) {
                return pos;
            },
            "move"(p, dir, pos) {
                return pos;
            },
            "varify"(p, pos) {
                return false;
            },
        },
    }
}