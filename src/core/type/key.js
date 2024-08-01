const id = "#core:key";
const type = ".json:key";
const name = "Key";

import string from "./string.js";

export default class extends string {
    static id = id
    static type = type
    static name = name

    init(data) {
        const {
            "#core:frame": frame,
            "#core:text-field": field,
        } = this.$type;
        
        this.data = data ?? [''];

        this.node_field = field(this.data.bclone()).into(this);

        this.struct =
            frame([
                ME.div.class("core-key-label")(
                    this.node_field.melem,
                    ME.div.class("core-key-hint")('→'),
                ),
            ])
                .into(this)
                .name(name)
                .color(180, 0.5, 1.1)
                .style_on("inline", "code");
    }
}