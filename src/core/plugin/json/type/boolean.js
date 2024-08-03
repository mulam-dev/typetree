const id = "#core:json:boolean";
const type = ".json:boolean";
const name = Names("Boolean");

export default class extends TTNode {
    static id = id
    static type = type
    static name = name

    static rule = {
        "modifiers": {
            "toggle": class extends TTModer.Sym {
                modify(node) {
                    super.modify(node);
                    node.data.val = !node.data.val;
                }
            },
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