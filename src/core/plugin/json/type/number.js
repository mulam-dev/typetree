const id = "#core:json:number";
const extend = null;
const provides = [".json:number"];
const name = Names("Number");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    static rule = {
        "modifiers": {
            "set": class extends TTModer.Map {
                modify(node, value) {
                    super.modify(node);
                    this.data_src = [node.data.val];
                    node.data.val = value;
                }
            },
        },
        "handles": {
            "core:text-field.edit"(p, content) {
                const val = Number.parseFloat(content);
                if (Number.isNaN(val)) {
                    this.data.val = this.data.val;
                } else if (this.data.val.toString() !== content) {
                    this.mod("set", val);
                }
            },
            "core:active"(p) {
                this.node_field.request_pack(p);
            },
        },
    }

    init(data) {
        const {
            "#core:text-field": field,
        } = this.$type;
        
        this.data = data ?? [0];

        this.node_field =
            field(this.data.bmap(v => v.toString()))
                .into(this)
                .name(name)
                .color(120, 0.5, 1.1)
                .style_on("inline", "code", "t-number");

        this.struct = this.node_field;
    }

    to_json() {
        return this.data[0];
    }
}