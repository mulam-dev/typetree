const id = "#core:text-field";
const extend = "#core:frame";
const provides = [];
const name = Names("Text Field");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    static rule = {
        "handles.core:active"() {
            setTimeout(() => {
                this.focus();
                this.select_all();
            }, 0);
        },
    }

    init(data) {
        this.data = data ?? [''];
        this.data_name = [null];
        this.data_color = [];
        this.data_styles = [];

        this.melem_content =
            ME.span
                .content_editable("true")
                .spellcheck("false")
                .draggable("false")
                .tab_index(-1)
                .$on({
                    "blur": () => this.parent?.request("core:text-field.edit", this.melem_content.elem.textContent),
                    "keydown": e => {
                        const kill = () => {
                            e.stopPropagation();
                            e.preventDefault();
                        };
                        switch (e.code) {
                            case "Enter":
                                if (!e.shiftKey) {
                                    kill();
                                    this.parent?.request("core:text-field.escape");
                                }
                                break;
                            case "Tab":
                                kill();
                                this.parent.request("core:text-field.escape");
                                break;
                        };
                    },
                    "dragover": e => {
                        e.preventDefault();
                        return false;
                    },
                    "drop": e => {
                        e.preventDefault();
                        return false;
                    },
                })
                .$text(this.data)();
        this.melem =
            ME.div
                .$class([
                    ["core-frame", "f-editable"],
                    this.data_styles.bmap(s => `f-${s}`),
                    this.data_color,
                ].bflat())
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

    select_all() {
        this.melem_content.select();
    }

    focus() {
        this.melem_content.focus({
            preventScroll: true,
        });
    }
}