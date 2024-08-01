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
    "able.core:layout.select": true,
    "handles.core:layout.has-node"(p, node) {
        return this.data.includes(node);
    },
    "handles.core:layout.get-selection"(p, anchor_node, focus_node) {
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
    "handles.core:selection.resolve"(p, anchor, focus) {
        if (anchor === focus) {
            if (this.data.length) {
                const pnode = this.data[anchor - 1];
                if (pnode) {
                    const rect = pnode.melem.rect;
                    return this.data_column > 1 ?
                        ["cursor", pnode, {dir: "x", x: rect.width, y: 0, size: rect.height}] :
                        ["cursor", pnode, {dir: "y", x: 0, y: rect.height, size: rect.width}];
                } else {
                    const nnode = this.data[anchor];
                    const rect = nnode.melem.rect;
                    return this.data_column > 1 ?
                        ["cursor", nnode, {dir: "x", x: 0, y: 0, size: rect.height}] :
                        ["cursor", nnode, {dir: "y", x: 0, y: 0, size: rect.width}];
                }
            } else {
                const {width: w, height: h} = this.melem.rect;
                return this.data_column > 1 ?
                    ["cursor", this, {dir: "x", x: w / 2, y: 0, size: h}] :
                    ["cursor", this, {dir: "y", x: 0, y: h / 2, size: w}];
            }
        } else {
            return ["range", this.data.slice(...[anchor, focus].sort())];
        }
    },
    "handles.core:selection.dir"(p, anchor, focus) {
        return this.data_column > 1 ? {left: true, right: true} : {top: true, bottom: true};
    },
    "handles.core:selection.collapse"(p, {dir, anchor, focus}) {
        if (["top", "left"].includes(dir)) {
            return Math.min(anchor, focus);
        }
        if (["bottom", "right"].includes(dir)) {
            return Math.max(anchor, focus);
        }
    },
    "handles.core:selection.side"(p, pos, dir) {
        if (["top", "left"].includes(dir)) {
            return 0;
        }
        if (["bottom", "right"].includes(dir)) {
            return this.data.length;
        }
    },
},

".json:object": {
    "able.core:layout.select": true,
    "handles.core:layout.has-node"(p, node) {
        return this.data.some(entry => entry.includes(node));
    },
    "handles.core:layout.get-selection"(p, anchor_node, focus_node) {
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
    "handles.core:selection.resolve"(p, anchor, focus) {
        if (anchor instanceof Array) {
            return ["range", this.data[anchor[0]].slice(...[anchor[1], focus[1]].sort())];
        } else {
            if (anchor === focus) {
                if (this.data.length) {
                    const pentry = this.data[anchor - 1];
                    if (pentry) {
                        const krect = pentry[0].melem.rect;
                        const vrect = pentry[1].melem.rect;
                        return ["cursor", pentry[0], {dir: "y", x: 0, y: krect.height, size: vrect.right - krect.left}];
                    } else {
                        const nentry = this.data[anchor];
                        const krect = nentry[0].melem.rect;
                        const vrect = nentry[1].melem.rect;
                        return ["cursor", nentry[0], {dir: "y", x: 0, y: 0, size: vrect.right - krect.left}];
                    }
                } else {
                    const {width: w, height: h} = this.melem.rect;
                    return ["cursor", this, {dir: "x", x: w / 2, y: 0, size: h}];
                }
            } else {
                return ["range", this.data.slice(...[anchor, focus].sort()).flat()];
            }
        }
    },
    "handles.core:selection.dir"(p, anchor, focus) {
        return {top: true, bottom: true};
    },
    "handles.core:selection.collapse"(p, {dir, anchor, focus}) {
        switch (dir) {
            case "top": return anchor instanceof Array ? anchor[0] : Math.min(anchor, focus);
            case "bottom": return anchor instanceof Array ? anchor[0] + 1 : Math.max(anchor, focus);
        }
    },
    "handles.core:selection.side"(p, pos, dir) {
        switch (dir) {
            case "top": return 0;
            case "bottom": return this.data.length;
            case "left": return pos instanceof Array ? [pos[0], 0] : pos;
            case "right": return pos instanceof Array ? [pos[0], 2] : pos;
        }
    },
},

}