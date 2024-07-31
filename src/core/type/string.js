const id = "#core:string";
const type = ".json:string";
const name = "String";

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
                type: Types.String,
            }]
            static call(node, value) {
                node.mod.set(value);
            }
        },
    }
    static handles = {...this.handles,
        "core:text-field": {
            "edit"(p, content) {
                if (this.data.val !== content) {
                    this.mod.set(content);
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
        
        this.data = data ?? [''];

        this.node_field =
            field(this.data.bclone())
                .into(this)
                .name(name)
                .prefix('"').suffix('"')
                .color(60, 0.5, 1.1)
                .style_on("inline", "code");

        this.struct = this.node_field;
    }

    to_json() {
        return this.data[0];
    }
}