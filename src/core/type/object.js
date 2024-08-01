const id = "#core:object";
const type = ".json:object";
const name = "Object";

export default class extends TTNode {
    static id = id
    static type = type
    static name = name

    static modifiers = {...this.modifiers,
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
    }
    static actions = {...this.actions,
        "core:delete": class extends TTAction {
            static name = Names("Delete")
            static call(node, {anchor: [r1], focus: [r2], selection}) {
                if (r1 !== r2) {
                    const [start, end] = [r1, r2].sort();
                    node.mod.modify_entries(start, end - start, []);
                    selection.set([start, 0], [start, 2]);
                }
            }
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