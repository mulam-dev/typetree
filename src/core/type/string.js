const id = "#core:string";
const type = ".json:string";
const name = "String";

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
                type: Types.String,
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
        
        this.data = data ?? [''];

        this.struct =
            frame(this.data.bmap(v => `"${v}"`))
                .name(name)
                .color(24, 0.56)
                .style_on("inline", "code");
    }

    to_json() {
        return this.data[0];
    }
}