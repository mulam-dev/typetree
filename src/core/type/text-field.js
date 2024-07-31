const id = "#core:text-field";
const type = null;
const name = "Text Field";

import frame from "./frame.js";

export default class extends frame {
    static id = id
    static type = type
    static name = name

    static handles = {...this.handles,
        "core:active"() {
            setTimeout(() => this.melem_content.focus(), 0);
        },
    }

    init(data) {
        this.data = data ?? [];
        this.data_name = [null];
        this.data_color = {};
        this.data_styles = [];

        this.melem_content =
            ME.span
                .content_editable("true")
                .spellcheck("false")
                .$on({
                    "blur": () => this.parent?.request("core:text-field.edit", this.melem_content.elem.textContent),
                })
                .$inner(this.data)();
        this.melem =
            ME.div
                .$class([["core-frame", "f-editable"], this.data_styles.bmap(s => `f-${s}`)].bflat())
                .$style(this.data_color)
            (
                this.melem_content,
            );

        this.melem.elem.node = this;
    }

    prefix(str) {
        this.melem.attr("data-prefix").val = str;
        return this;
    }

    suffix(str) {
        this.melem.attr("data-suffix").val = str;
        return this;
    }
}