const id = "#core:number";
const type = ".json:number";
const name = "Number";

export default class extends TTNode {
    static id = id
    static type = type
    static name = name

    static modifiers = {...this.modifiers,
        "set": class extends TTModer.Map {
            modify(node, value) {
                super.modify(node);
                this.data_src = [node.data.val];
                node.data.val = value;
            }
        },
    }
    static actions = {...this.actions,
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
    static handles = {...this.handles,
        "core:text-field": {
            "edit"(p, content) {
                const val = Number.parseFloat(content);
                if (Number.isNaN(val)) {
                    this.data.val = this.data.val;
                } else if (this.data.val.toString() !== content) {
                    this.mod.set(val);
                }
            },
        },
        "core:active"(p) {
            this.node_field.request_pack(p);
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