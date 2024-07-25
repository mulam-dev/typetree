const id = "#core:boolean";
const type = ".json:boolean";
const name = "Boolean";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    static modifiers = {
        "toggle": class extends TTModer.Sym {
            modify(node) {
                super.modify(node);
                node.data.val = !node.data.val;
            }
        },
    }
    static actions = {
        "toggle": class extends TTAction {
            static name = Names("Toggle")
            static call(node) {
                node.mod.toggle();
            }
        },
    }

    init(data) {
        const {
            "#core:frame": frame,
        } = this.require;
        
        this.data = data ?? [false];

        this.struct =
            frame(this.data.bmap(v => v.toString()))
                .name(name)
                .color(207, 0.62)
                .style_on("inline", "code");
    }

    to_json() {
        return this.data[0];
    }
}