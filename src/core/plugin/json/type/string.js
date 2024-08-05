const id = "#core:json:string";
const extend = null;
const provides = [".json:string"];
const name = Names("String");

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
            "core:text-field": {
                "edit"(p, content) {
                    if (this.data.val !== content) {
                        this.mod("set", content);
                    }
                },
                "escape"(p) {
                    this.root.focus();
                },
            },
            "core:active"(p) {
                this.node_field.request_pack(p);
            },
            "core:enter"(p) {
                this.node_field.request("core:active");
            },
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
                .color(60, 0.5, 1.2)
                .style_on("inline", "code");

        this.struct = this.node_field;
    }

    to_json() {
        return this.data[0];
    }

    select_all() {
        this.node_field.select_all();
    }
}