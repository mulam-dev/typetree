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
        if (this.data.length) {
            this.data_column = Math.min(this.data_column, this.data.length);
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
        }
    },
    "able.core:layout.select": true,
    "handles.core:layout": {
        "has-node"(p, node) {
            return this.data.includes(node);
        },
        "get-selection"(p, anchor_node, focus_node) {
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
    },
    "handles.core:selection": {
        "resolve"(p, {anchor, focus}) {
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
                    return ["cursor", this, {dir: "x", x: w / 2, y: 0, size: h}];
                }
            } else {
                return ["range", this.data.slice(...[anchor, focus].sort())];
            }
        },
        "dir"(p) {
            return this.data_column > 1 ? {left: true, right: true} : {top: true, bottom: true};
        },
        "collapse"(p, dir, {anchor, focus}) {
            if (["top", "left"].includes(dir)) {
                return (p => [p, p])(Math.min(anchor, focus));
            }
            if (["bottom", "right"].includes(dir)) {
                return (p => [p, p])(Math.max(anchor, focus));
            }
        },
        "collapsed"(p, dir, {anchor, focus}) {
            return anchor === focus;
        },
        "side"(p, dir, pos) {
            if (["top", "left"].includes(dir)) {
                return 0;
            }
            if (["bottom", "right"].includes(dir)) {
                return this.data.length;
            }
        },
        "move"(p, dir, pos) {
            switch (dir) {
                case "top": return pos - this.data_column.val;
                case "bottom": return pos + this.data_column.val;
                case "left": return pos - 1;
                case "right": return pos + 1;
            }
        },
        "varify"(p, pos) {
            return 0 <= pos && pos <= this.data.length;
        },
    },
},

".json:object": {
    "able.core:layout.select": true,
    "handles.core:layout": {
        "has-node"(p, node) {
            return this.data.some(entry => entry.includes(node));
        },
        "get-selection"(p, anchor_node, focus_node) {
            let anchor_entry_idx = this.data.findIndex(entry => entry.includes(anchor_node));
            let focus_entry_idx = this.data.findIndex(entry => entry.includes(focus_node));
            const entry_idx = anchor_entry_idx;
            if (anchor_entry_idx <= focus_entry_idx) {
                focus_entry_idx++;
            } else {
                anchor_entry_idx++;
            }
            if (Math.abs(anchor_entry_idx - focus_entry_idx) > 1) {
                return this.$type["#core:selection"]({
                    scope: this,
                    anchor: [anchor_entry_idx, 0], focus: [focus_entry_idx, 2],
                });
            } else {
                const entry = this.data[entry_idx];
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
    },
    "handles.core:selection": {
        "resolve"(p, {anchor: [r1, c1], focus: [r2, c2]}) {
            [[r1, r2], [c1, c2]] = [[r1, r2].sort(), [c1, c2].sort()];
            if (r1 === r2) {
                if (this.data.length) {
                    const pentry = this.data[r1 - 1];
                    if (pentry) {
                        const krect = pentry[0].melem.rect;
                        const vrect = pentry[1].melem.rect;
                        return ["cursor", pentry[0], {dir: "y", x: 0, y: krect.height, size: vrect.right - krect.left}];
                    } else {
                        const nentry = this.data[r1];
                        const krect = nentry[0].melem.rect;
                        const vrect = nentry[1].melem.rect;
                        return ["cursor", nentry[0], {dir: "y", x: 0, y: 0, size: vrect.right - krect.left}];
                    }
                } else {
                    const {width: w, height: h} = this.melem.rect;
                    return ["cursor", this, {dir: "x", x: w / 2, y: 0, size: h}];
                }
            } else {
                return ["range", this.data.slice(r1, r2).map(entry => entry.slice(c1, c2)).flat()];
            }
        },
        "dir"(p) {
            return {top: true, bottom: true};
        },
        "collapse"(p, dir, {anchor: [c1], focus: [c2]}) {
            if (["top", "left"].includes(dir)) {
                return (c => [[c, 0], [c, 2]])(Math.min(c1, c2));
            }
            if (["bottom", "right"].includes(dir)) {
                return (c => [[c, 0], [c, 2]])(Math.max(c1, c2));
            }
        },
        "collapsed"(p, dir, {anchor, focus}) {
            return anchor[0] === focus[0];
        },
        "side"(p, dir, pos) {
            switch (dir) {
                case "top": return [0, pos[1]];
                case "bottom": return [this.data.length, pos[1]];
                case "left": return [pos[0], 0];
                case "right": return [pos[0], 2];
            }
        },
        "move"(p, dir, pos) {
            switch (dir) {
                case "top": return [pos[0] - 1, pos[1]];
                case "bottom": return [pos[0] + 1, pos[1]];
                case "left": return [pos[0], pos[1] - 1];
                case "right": return [pos[0], pos[1] + 1];
            }
        },
        "varify"(p, [r, c], [anchor, focus]) {
            return (
                0 <= r && r <= this.data.length &&
                0 <= c && c <= 2 &&
                anchor[1] !== focus[1] && (
                    Math.abs(anchor[0] - focus[0]) <= 1 ||
                    Math.abs(anchor[1] - focus[1]) === 2
                )
            );
        },
    },
},

}