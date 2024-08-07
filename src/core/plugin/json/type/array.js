const id = "#core:json:array";
const extend = null;
const provides = [".json:array"];
const name = Names("Array");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    static rule = {
        "modifiers": {
            "modify": class extends TTModer.Map {
                modify(node, offset, delete_count, inserts) {
                    super.modify(node);
                    const deletes = node.data.modify(offset, delete_count, inserts);
                    this.data_src = [offset, inserts.length, deletes];
                }
            },
            "move": class extends TTModer.Map {
                modify(node, offset, count, delta) {
                    super.modify(node);
                    this.data_src = [offset + delta, count, -delta];
                    node.data.move(offset, count, delta);
                }
            },
        },
        "able.core:layout.select": true,
        "handles.core:layout": {
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
            "enter"(p, sel) {
                sel.data_scope.val = this;
                sel.set(0, Math.min(this.data.length, 1));
            },
            "select"(p, sel, node) {
                sel.data_scope.val = this;
                const offset = this.data.indexOf(node);
                sel.set(offset, offset + 1);
            },
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
                    return ["range", this.data.slice(...[anchor, focus].num_sorted())];
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
        "able.core:selection.scaler.right": true,
        "handles.core:selection.scaler.right.move"(p, {move_x, delta_x, start_rect, current_rect}) {
            if (this.data.length) {
                this.data_column.val = Math.min(this.data_column.val, this.data.length);
                delta_x += start_rect.right - this.melem.rect.right;
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
    }

    init(data) {
        const {
            "#core:frame": frame,
        } = this.$type;

        this.data = (data ?? []).guard(null, n => n.into(this), n => n.outof());
        this.data_column = [this.data.length && this.data.every(n => n.is(".json:number")) ? data.length : 1];

        this.struct =
            frame([
                ME.div
                    .class("core-array-flex")
                    .$style({
                        "--column": this.data_column.bclone(),
                    })
                    .$inner(
                        this.data.bflat().bmap(node => node.melem)
                    )(),
            ]).into(this).name(name).color(200).style_on("sbracket-before", "sbracket-after");
    }

    to_json() {
        return this.data.map(node => node.to_json());
    }

    get(index) {
        return this.data[index];
    }
    
    index(node) {
        return this.data.indexOf(node);
    }

    has(node) {
        return this.data.includes(node);
    }
}