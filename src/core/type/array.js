const id = "#core:array";
const type = ".json:array";
const name = "Array";

export default class extends TTNode {
    static id = id
    static type = type
    static name = name

    static modifiers = {...this.modifiers,
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
    }
    static actions = {...this.actions,
        "core:delete": class extends TTAction {
            static name = Names("Delete")
            static call(node, {anchor, focus, selection}) {
                const [start, end] = [anchor, focus].sort();
                node.mod.modify(start, end - start, []);
                selection.set(start, start);
            }
        },
    }

    init(data) {
        const {
            "#core:frame": frame,
        } = this.$type;

        this.data = (data ?? []).guard(null, n => n.into(this), n => n.outof());
        this.data_column = [this.data.every(n => n.constructor.type === ".json:number") ? data.length : 1];

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
        Object.fromEntries(this.data.map(([k, v]) => [k.to_json(), v.to_json()]));
    }
}