const id = "#core:array";
const type = ".json:array";
const name = "Array";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    static modifiers = {
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
    static actions = {
        "modify": class extends TTAction {
            static name = Names("Modify")
            static args = [{
                name: Names("Offset"),
                type: Types.Number,
            }, {
                name: Names("Delete Count"),
                type: Types.Number,
            }, {
                name: Names("Inserts"),
                type: Types.Array,
            }]
            static call(node, ...args) {
                node.mod.modify(...args);
            }
        },
        "move": class extends TTAction {
            static name = Names("Move")
            static args = [{
                name: Names("Offset"),
                type: Types.Number,
            }, {
                name: Names("Count"),
                type: Types.Number,
            }, {
                name: Names("Delta"),
                type: Types.Number,
            }]
            static call(node, ...args) {
                node.mod.move(...args);
            }
        },
    }

    init(data) {
        const {
            "#core:frame": frame,
        } = this.require;

        this.data = data ?? [];

        this.struct =
            frame([
                ME.div
                    .class("core-array-flex")
                    .$inner(
                        this.data.bflat().bmap(node => node.elem)
                    )(),
            ]).name(name).color(200).style_on("sbracket-before");
    }

    to_json() {
        Object.fromEntries(this.data.map(([k, v]) => [k.to_json(), v.to_json()]));
    }
}