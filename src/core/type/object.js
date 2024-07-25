const id = "#core:object";
const type = ".json:object";
const name = "Object";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    static modifiers = {
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
    static actions = {
        "modify_entries": class extends TTAction {
            static name = Names("Modify Entries")
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
                node.mod.modify_entries(...args);
            }
        },
        "move_entries": class extends TTAction {
            static name = Names("Move Entries")
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
                node.mod.move_entries(...args);
            }
        },
        "modify_value": class extends TTAction {
            static name = Names("Modify Value")
            static args = [{
                name: Names("Index"),
                type: Types.Number,
            }, {
                name: Names("value"),
                type: Types.Node,
            }]
            static call(node, ...args) {
                node.mod.modify_value(...args);
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
                    .class("core-object-grid")
                    .$inner(
                        this.data.bflat().bmap(node => node.elem)
                    )(),
            ]).name(name).color(42).style_on("hint-before");
    }

    to_json() {
        Object.fromEntries(this.data.map(([k, v]) => [k.to_json(), v.to_json()]));
    }
}