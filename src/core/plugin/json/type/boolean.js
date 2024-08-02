const id = "#core:boolean";
const type = ".json:boolean";
const name = "Boolean";

export default class extends TTNode {
    static id = id
    static type = type
    static name = name

    static modifiers = {...this.modifiers,
        "toggle": class extends TTModer.Sym {
            modify(node) {
                super.modify(node);
                node.data.val = !node.data.val;
            }
        },
    }
    static actions = {...this.actions,
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
        } = this.$type;
        
        this.data = data ?? [false];

        this.struct =
            frame(this.data.bmap(v => v.toString()))
                .into(this)
                .name(name)
                .color(200, 0.62)
                .style_on("inline", "code");
    }

    to_json() {
        return this.data[0];
    }
}