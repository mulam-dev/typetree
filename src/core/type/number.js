const id = "#core:number";
const type = ".json:number";
const name = "Number";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    static modifiers = {
        "set": class extends TTModer.Map {
            modify(node, value) {
                super.modify(node);
                this.data_src = [node.data.val];
                node.data.val = value;
            }
        },
    }
    static actions = {
        "set": class extends TTAction {
            static name = Names("Set")
            static args = [{
                name: Names("Value"),
                type: Types.Number,
            }]
            static call(node, value) {
                node.mod.set(value);
            }
        },
    }

    init(data) {
        const {
            "#core:frame": frame,
        } = this.require;
        
        this.data = data ?? [0];

        this.struct =
            frame(this.data.bmap(v => v.toString()))
                .name(name)
                .color(83, 0.32)
                .style_on("inline", "code");
    }

    to_json() {
        return this.data[0];
    }
}