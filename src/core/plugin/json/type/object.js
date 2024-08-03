const id = "#core:json:object";
const extend = null;
const provides = [".json:object"];
const name = Names("Object");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    static rule = {
        "modifiers": {
            "modify_entries": class extends TTModer.Map {
                modify(node, offset, delete_count, inserts) {
                    super.modify(node);
                    const deletes = node.data.modify(offset, delete_count, inserts);
                    this.data_src = [offset, inserts.length, deletes];
                }
            },
            "move_entries": class extends TTModer.Map {
                modify(node, offset, count, delta) {
                    super.modify(node);
                    this.data_src = [offset + delta, count, -delta];
                    node.data.move(offset, count, delta);
                }
            },
            "modify_value": class extends TTModer.Map {
                modify(node, index, value) {
                    super.modify(node);
                    const [pre_value] = node.data[index].set(1, value);
                    this.data_src = [index, pre_value];
                }
            },
        },
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
                [[r1, r2], [c1, c2]] = [[r1, r2].num_sorted(), [c1, c2].num_sorted()];
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
    }

    init(data) {
        const {
            "#core:frame": frame,
        } = this.$type;

        this.data = (data ?? []).guard(null, entry => entry.forEach(n => n.into(this)), entry => entry.forEach(n => n.outof()));

        this.struct =
            frame([
                ME.div
                    .class("core-object-grid")
                    .$inner(
                        this.data.bflat().bmap(node => node.melem)
                    )(),
            ]).into(this).name(name).color(180, 0.5, 1.1).style_on("hint-before");
    }

    to_json() {
        Object.fromEntries(this.data.map(([k, v]) => [k.to_json(), v.to_json()]));
    }

    get(index) {
        return this.data[index[0]][index[1]];
    }
    
    index(node) {
        const row = this.data.findIndex(entry => entry.includes(node));
        return [row, this.data[row].indexOf(node)];
    }
}