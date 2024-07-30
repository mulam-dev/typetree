export default {

".json:boolean": {
    "able.core:edit": true,
    "handles.core:edit"() {
        this.act.toggle();
    },
},

".json:string": {
    "able.core:edit": true,
    "handles.core:edit"() {
        const res = this.$require["core:editor:inline-code"].edit(this.data.val);
        if (res !== null) {
            this.act.set(res);
        }
    },
},

".json:number": {
    "able.core:edit": true,
    "handles.core:edit"() {
        const res = this.$require["core:editor:inline-code"].edit(this.data.val.toString());
        if (res !== null) {
            try {
                this.act.set(Number.parseFloat(res));
            } catch (_) {}
        }
    },
},

".json:array": {
    "able.core:scale.right": true,
    "handles.core:scale.right.move"(p, {move_x, delta_x, start_rect, current_rect}) {
        delta_x -= current_rect.width - start_rect.width;
        const prev_node = this.data[this.data_column - 1];
        const prev_rect = prev_node.melem.rect;
        const next_node = this.data[this.data_column];
        if (delta_x > 8 && move_x > 0 && next_node) {
            const next_rect = next_node.melem.rect;
            if (prev_rect.right - current_rect.left + next_rect.width / 2 <
                current_rect.width + delta_x) {
                this.data_column.val++;
            }
        } else if (delta_x < -8 && move_x < 0 && this.data_column.val > 1) {
            if (prev_rect.right - current_rect.left - prev_rect.width / 2 >
                current_rect.width + delta_x) {
                this.data_column.val--;
            }
        }
    },
    "able.core:select": true,
    "handles.core:select.has-node"(p, node) {
        return this.data.includes(node);
    },
    "handles.core:select.get-selection"(p, anchor_node, focus_node) {
        let anchor = this.data.indexOf(anchor_node);
        let focus = this.data.indexOf(focus_node);
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
    "handles.core:selection:get-nodes"(p, anchor, focus) {
        return this.data.slice(...[anchor, focus].sort());
    },
},

".json:object": {
    "able.core:select": true,
    "handles.core:select.has-node"(p, node) {
        return this.data.some(entry => entry.includes(node));
    },
    "handles.core:select.get-selection"(p, anchor_node, focus_node) {
        let anchor_entry_idx = this.data.findIndex(entry => entry.includes(anchor_node));
        let focus_entry_idx = this.data.findIndex(entry => entry.includes(focus_node));
        if (anchor_entry_idx !== focus_entry_idx) {
            if (anchor_entry_idx <= focus_entry_idx) {
                focus_entry_idx++;
            } else {
                anchor_entry_idx++;
            }
            return this.$type["#core:selection"]({
                scope: this,
                anchor: anchor_entry_idx, focus: focus_entry_idx,
            });
        } else {
            const entry = this.data[anchor_entry_idx];
            let anchor = entry.indexOf(anchor_node);
            let focus = entry.indexOf(focus_node);
            if (anchor <= focus) {
                focus++;
            } else {
                anchor++;
            }
            return this.$type["#core:selection"]({
                scope: this,
                anchor: [anchor_entry_idx, anchor], focus: [focus_entry_idx, focus],
            });
        }
    },
    "handles.core:selection:get-nodes"(p, anchor, focus) {
        if (anchor instanceof Array) {
            return this.data[anchor[0]].slice(...[anchor[1], focus[1]].sort());
        } else {
            return this.data.slice(...[anchor, focus].sort()).flat();
        }
    },
},

}