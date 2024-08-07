const id = "#core:json:boolean";
const extend = null;
const provides = [".json:boolean"];
const name = Names("Boolean");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
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
        "handles": {
            "core:selection": {
                "enter"(p) {
                    this.mod("toggle");
                },
            },
        },
    }

    init(data) {
        this.data = data ?? [false];
    }

    struct() {
        const {
            "#core:frame": frame,
        } = this.$type;
        return frame(this.data.bmap(v => v.toString()))
            .into(this)
            .name(name)
            .color(200, 0.62)
            .style_on("inline", "code")
            .melem;
    }

    to_json() {
        return this.data[0];
    }
}